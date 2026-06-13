import json
from urllib.parse import urlencode

import frappe
from frappe import _
from frappe.utils import flt, getdate, now_datetime, today


@frappe.whitelist()
def get_sales_day_context(pos_profile=None):
	profiles = get_user_pos_profiles()
	selected_profile = pos_profile or get_default_profile(profiles)
	opening_entry = get_opening_entry(selected_profile) if selected_profile else None

	return {
		"profiles": profiles,
		"selected_profile": selected_profile,
		"opening_entry": opening_entry,
		"dashboard": get_dashboard(selected_profile),
		"payment_modes": get_payment_modes(selected_profile),
	}


@frappe.whitelist()
def start_sales_day(pos_profile):
	if not pos_profile:
		frappe.throw(_("Please select a POS Profile before starting the sales day."))

	existing = get_opening_entry(pos_profile)
	if existing:
		return {"opening_entry": existing, "route": "cmat-pos"}

	profile = frappe.get_doc("POS Profile", pos_profile)
	if profile.disabled:
		frappe.throw(_("POS Profile {0} is disabled.").format(pos_profile))

	payments = []
	for payment in profile.payments:
		payments.append(
			{
				"mode_of_payment": payment.mode_of_payment,
				"opening_amount": 0,
			}
		)

	if not payments:
		frappe.throw(_("POS Profile {0} has no payment modes. Add Cash, Mobile Money, and Bank.").format(pos_profile))

	opening = frappe.get_doc(
		{
			"doctype": "POS Opening Entry",
			"period_start_date": now_datetime(),
			"posting_date": today(),
			"company": profile.company,
			"pos_profile": pos_profile,
			"user": frappe.session.user,
			"balance_details": payments,
		}
	)
	opening.insert(ignore_permissions=True)
	opening.submit()

	return {"opening_entry": opening.name, "route": "cmat-pos"}


@frappe.whitelist()
def get_simple_pos_context(pos_profile=None, search_term=""):
	profiles = get_user_pos_profiles()
	selected_profile = pos_profile or get_default_profile(profiles)

	return {
		"profiles": profiles,
		"selected_profile": selected_profile,
		"opening_entry": get_opening_entry(selected_profile) if selected_profile else None,
		"dashboard": get_dashboard(selected_profile),
		"payment_modes": get_payment_modes(selected_profile),
		"items": get_pos_items(selected_profile, search_term),
	}


@frappe.whitelist()
def checkout(pos_profile, items, mode_of_payment=None, transaction_type="Sale"):
	if not pos_profile:
		frappe.throw(_("Please select a POS Profile."))
	transaction_type = transaction_type or "Sale"
	if transaction_type not in get_transaction_types():
		frappe.throw(_("Invalid POS transaction type."))
	if transaction_type == "Sale" and not mode_of_payment:
		frappe.throw(_("Please select how the customer paid."))

	opening_entry = get_opening_entry(pos_profile)
	if not opening_entry:
		frappe.throw(_("Please start the sales day before checkout."))

	if get_existing_daily_sales_invoice(pos_profile):
		frappe.throw(_("Sales day has already ended. Please start a new sales day before selling again."))

	if isinstance(items, str):
		items = json.loads(items)

	if not items:
		frappe.throw(_("Please add at least one item."))

	profile = frappe.get_cached_doc("POS Profile", pos_profile)
	if transaction_type == "Sale":
		allowed_modes = {payment.mode_of_payment for payment in profile.payments}
		if mode_of_payment not in allowed_modes:
			frappe.throw(_("{0} is not allowed in POS Profile {1}.").format(mode_of_payment, pos_profile))

	validate_stock_available(pos_profile, opening_entry, items)

	sale = frappe.new_doc("CMAT POS Sale")
	sale.pos_profile = pos_profile
	sale.opening_entry = opening_entry
	sale.transaction_type = transaction_type
	sale.company = profile.company
	sale.customer = profile.customer
	sale.user = frappe.session.user
	sale.posting_date = today()
	sale.posting_time = now_datetime().time()
	sale.mode_of_payment = mode_of_payment if transaction_type == "Sale" else None

	for row in items:
		item_code = row.get("item_code")
		qty = flt(row.get("qty"))
		if not item_code or qty <= 0:
			continue

		uom = row.get("uom") or frappe.get_cached_value("Item", item_code, "stock_uom")
		rate = get_item_rate(item_code, pos_profile, uom, profile.selling_price_list) if transaction_type == "Sale" else 0
		sale.append(
			"items",
			{
				"item_code": item_code,
				"item_name": frappe.get_cached_value("Item", item_code, "item_name"),
				"qty": qty,
				"uom": uom,
				"rate": rate,
				"amount": qty * rate,
			},
		)

	if not sale.items:
		frappe.throw(_("Please add valid items before checkout."))

	sale.insert(ignore_permissions=True)
	sale.submit()
	stock_entry = None
	if transaction_type != "Sale":
		stock_entry = make_stock_use_entry(pos_profile, sale)
		if stock_entry:
			frappe.db.set_value("CMAT POS Sale", sale.name, "stock_entry", stock_entry)

	return {
		"sale": sale.name,
		"doctype": sale.doctype,
		"transaction_type": transaction_type,
		"stock_entry": stock_entry,
		"grand_total": sale.grand_total,
		"rounded_total": sale.grand_total,
		"payment_mode": mode_of_payment,
		"print_url": get_print_url(sale),
		"dashboard": get_dashboard(pos_profile),
	}


@frappe.whitelist()
def end_sales_day(pos_profile, cash_deposited=0, mobile_money_amount=0):
	if not pos_profile:
		frappe.throw(_("Please select a POS Profile."))

	cash_deposited = flt(cash_deposited)
	mobile_money_amount = flt(mobile_money_amount)

	opening_entry = get_opening_entry(pos_profile)
	if not opening_entry:
		frappe.throw(_("There is no open sales day for this POS Profile."))

	existing_invoice = get_existing_daily_sales_invoice(pos_profile)
	if existing_invoice:
		invoice = frappe.get_doc("Sales Invoice", existing_invoice)
		save_sales_day_deposit(
			pos_profile,
			opening_entry,
			cash_deposited,
			mobile_money_amount,
			flt(invoice.rounded_total or invoice.grand_total),
			invoice.name,
		)
		return {
			"invoice": invoice.name,
			"grand_total": invoice.grand_total,
			"rounded_total": invoice.rounded_total,
			"print_url": get_print_url(invoice),
			"dashboard": get_dashboard(pos_profile),
			"summary": get_sales_day_summary(pos_profile, opening_entry, invoice.name),
			"sales_count": 0,
		}

	sales = get_uninvoiced_sales(pos_profile, opening_entry)
	if not sales:
		summary = get_sales_day_summary(pos_profile, opening_entry)
		save_sales_day_deposit(
			pos_profile,
			opening_entry,
			cash_deposited,
			mobile_money_amount,
			flt(summary.get("total_sales")),
		)
		summary = get_sales_day_summary(pos_profile, opening_entry)
		if summary.get("has_activity"):
			return {
				"invoice": None,
				"grand_total": 0,
				"rounded_total": 0,
				"print_url": None,
				"dashboard": get_dashboard(pos_profile),
				"summary": summary,
				"sales_count": 0,
			}
		frappe.throw(_("No new sales found for this sales day."))

	try:
		invoice = make_daily_sales_invoice(pos_profile, sales)
	except Exception as exc:
		if is_payment_account_error(exc):
			frappe.throw(
				_(
					"Payment setup needs correction. Please ask the manager to set Cash, Mobile Money, or Bank accounts in the POS Profile."
				),
				title=_("Payment Setup Needed"),
			)
		raise
	for sale in sales:
		frappe.db.set_value("CMAT POS Sale", sale.name, {"sales_invoice": invoice.name, "status": "Invoiced"})

	save_sales_day_deposit(
		pos_profile,
		opening_entry,
		cash_deposited,
		mobile_money_amount,
		flt(invoice.rounded_total or invoice.grand_total),
		invoice.name,
	)
	frappe.db.commit()
	return {
		"invoice": invoice.name,
		"grand_total": invoice.grand_total,
		"rounded_total": invoice.rounded_total,
		"print_url": get_print_url(invoice),
		"dashboard": get_dashboard(pos_profile),
		"summary": get_sales_day_summary(pos_profile, opening_entry, invoice.name),
		"sales_count": len(sales),
	}


@frappe.whitelist()
def get_dashboard(pos_profile=None):
	if not pos_profile:
		return empty_dashboard()

	sales = frappe.get_all(
		"CMAT POS Sale",
		filters={
			"docstatus": 1,
			"posting_date": getdate(today()),
			"pos_profile": pos_profile,
			"transaction_type": "Sale",
		},
		fields=["name", "grand_total", "total_qty"],
	)

	sale_names = [sale.name for sale in sales]
	total_sales = sum(flt(sale.grand_total) for sale in sales)
	litres = get_litres_sold(sale_names)

	return {
		"today_sales": total_sales,
		"litres_sold": litres,
		"bought_today": len(sales),
		"staff_use_qty": get_usage_qty(pos_profile, "Staff Use"),
		"sample_qty": get_usage_qty(pos_profile, "Sample"),
		"loss_qty": get_usage_qty(pos_profile, "Loss"),
	}


def get_transaction_types():
	return {"Sale", "Staff Use", "Sample", "Loss"}


def get_pos_items(pos_profile, search_term=""):
	if not pos_profile:
		return []

	profile = frappe.get_cached_doc("POS Profile", pos_profile)
	price_list = profile.selling_price_list
	if not price_list:
		return []

	item_group = get_root_item_group()
	try:
		from erpnext.selling.page.point_of_sale.point_of_sale import get_items

		result = get_items(
			start=0,
			page_length=120,
			price_list=price_list,
			item_group=item_group,
			pos_profile=pos_profile,
			search_term=search_term or "",
		)
		items = result.get("items", []) if isinstance(result, dict) else result
		return add_stock_availability(pos_profile, remove_disabled_items(items))
	except Exception:
		return get_basic_items(profile, search_term)


def remove_disabled_items(items):
	filtered_items = []
	for item in items or []:
		item_code = item.get("item_code") or item.get("name")
		if item_code and frappe.get_cached_value("Item", item_code, "disabled"):
			continue
		filtered_items.append(item)
	return filtered_items


def get_basic_items(profile, search_term=""):
	filters = {"disabled": 0, "is_sales_item": 1, "has_variants": 0, "is_fixed_asset": 0}
	if search_term:
		filters["item_name"] = ["like", f"%{search_term}%"]

	items = frappe.get_all(
		"Item",
		filters=filters,
		fields=["name as item_code", "item_name", "stock_uom", "image as item_image"],
		order_by="item_name asc",
		limit=120,
	)
	for item in items:
		item["uom"] = item.stock_uom
		item["price_list_rate"] = get_item_rate(item.item_code, profile.name, item.stock_uom, profile.selling_price_list)
	return add_stock_availability(profile.name, items)


def add_stock_availability(pos_profile, items):
	if not items:
		return []

	profile = frappe.get_cached_doc("POS Profile", pos_profile)
	opening_entry = get_opening_entry(pos_profile)

	for item in items:
		item_code = item.get("item_code")
		uom = item.get("uom") or item.get("stock_uom")
		is_stock_item = frappe.get_cached_value("Item", item_code, "is_stock_item") if item_code else 0
		item["is_stock_item"] = is_stock_item

		if not item_code or not is_stock_item:
			item["available_qty"] = None
			item["stock_status"] = "not_tracked"
			continue

		available_stock_qty = get_available_stock_qty(item_code, profile.warehouse, pos_profile, opening_entry)
		conversion = get_uom_conversion_factor(item_code, uom)
		available_qty = available_stock_qty / conversion if conversion else available_stock_qty
		item["available_qty"] = max(flt(available_qty, 3), 0)
		item["warehouse"] = profile.warehouse
		item["stock_status"] = "out" if item["available_qty"] <= 0 else "available"

	return items


def validate_stock_available(pos_profile, opening_entry, items):
	profile = frappe.get_cached_doc("POS Profile", pos_profile)
	requested = {}

	for row in items:
		item_code = row.get("item_code")
		qty = flt(row.get("qty"))
		if not item_code or qty <= 0:
			continue

		if not frappe.get_cached_value("Item", item_code, "is_stock_item"):
			continue

		uom = row.get("uom") or frappe.get_cached_value("Item", item_code, "stock_uom")
		requested[item_code] = requested.get(item_code, 0) + qty * get_uom_conversion_factor(item_code, uom)

	for item_code, requested_qty in requested.items():
		available_qty = get_available_stock_qty(item_code, profile.warehouse, pos_profile, opening_entry)
		if requested_qty > available_qty:
			frappe.throw(
				_("{0} has only {1} available in {2}.").format(
					frappe.bold(item_code),
					frappe.bold(flt(available_qty, 2)),
					frappe.bold(profile.warehouse),
				),
				title=_("Insufficient Stock"),
			)


def get_available_stock_qty(item_code, warehouse, pos_profile, opening_entry=None):
	if not warehouse:
		return 0

	actual_qty = flt(frappe.db.get_value("Bin", {"item_code": item_code, "warehouse": warehouse}, "actual_qty"))
	pending_qty = get_pending_sales_stock_qty(item_code, pos_profile, opening_entry)
	return actual_qty - pending_qty


def get_pending_sales_stock_qty(item_code, pos_profile, opening_entry=None):
	conditions = [
		"sale.docstatus = 1",
		"sale.pos_profile = %(pos_profile)s",
		"ifnull(sale.sales_invoice, '') = ''",
		"ifnull(sale.stock_entry, '') = ''",
		"item.item_code = %(item_code)s",
	]
	values = {"pos_profile": pos_profile, "item_code": item_code}

	if opening_entry:
		conditions.append("sale.opening_entry = %(opening_entry)s")
		values["opening_entry"] = opening_entry

	rows = frappe.db.sql(
		f"""
		select item.qty, item.uom
		from `tabCMAT POS Sale Item` item
		inner join `tabCMAT POS Sale` sale on sale.name = item.parent
		where {" and ".join(conditions)}
		""",
		values,
		as_dict=True,
	)

	return sum(flt(row.qty) * get_uom_conversion_factor(item_code, row.uom) for row in rows)


def get_uom_conversion_factor(item_code, uom):
	stock_uom = frappe.get_cached_value("Item", item_code, "stock_uom")
	if not uom or uom == stock_uom:
		return 1

	conversion = frappe.db.get_value(
		"UOM Conversion Detail",
		{"parent": item_code, "uom": uom},
		"conversion_factor",
	)
	return flt(conversion) or 1


def get_root_item_group():
	return frappe.db.get_value("Item Group", {"lft": 1, "is_group": 1}, "name") or "All Item Groups"


def get_item_rate(item_code, pos_profile, uom=None, price_list=None):
	profile = frappe.get_cached_doc("POS Profile", pos_profile)
	price_list = price_list or profile.selling_price_list
	uom = uom or frappe.get_cached_value("Item", item_code, "stock_uom")

	rate = frappe.db.get_value(
		"Item Price",
		{
			"item_code": item_code,
			"price_list": price_list,
			"selling": 1,
			"uom": uom,
		},
		"price_list_rate",
	)
	if rate is None:
		rate = frappe.db.get_value(
			"Item Price",
			{"item_code": item_code, "price_list": price_list, "selling": 1},
			"price_list_rate",
		)
	if rate is None:
		rate = frappe.get_cached_value("Item", item_code, "standard_rate")

	return flt(rate)


def get_uninvoiced_sales(pos_profile, opening_entry):
	return frappe.get_all(
		"CMAT POS Sale",
		filters={
			"docstatus": 1,
			"pos_profile": pos_profile,
			"opening_entry": opening_entry,
			"transaction_type": "Sale",
			"sales_invoice": ["in", ["", None]],
		},
		fields=["name", "mode_of_payment", "grand_total"],
		order_by="creation asc",
	)


def get_existing_daily_sales_invoice(pos_profile):
	result = frappe.db.sql(
		"""
		select distinct sales_invoice
		from `tabCMAT POS Sale`
		where docstatus = 1
			and pos_profile = %s
			and posting_date = %s
			and ifnull(sales_invoice, '') != ''
		limit 1
		""",
		(pos_profile, today()),
		as_dict=True,
	)
	return result[0].sales_invoice if result else None


def get_sales_day_summary(pos_profile, opening_entry, invoice=None):
	profile = frappe.get_cached_doc("POS Profile", pos_profile)
	opening = frappe.get_doc("POS Opening Entry", opening_entry) if opening_entry else None
	start_datetime = opening.period_start_date if opening else now_datetime()
	end_datetime = now_datetime()
	deposit = get_sales_day_deposit(opening_entry)

	sales = frappe.get_all(
		"CMAT POS Sale",
		filters={
			"docstatus": 1,
			"pos_profile": pos_profile,
			"opening_entry": opening_entry,
		},
		fields=["name", "transaction_type", "mode_of_payment", "grand_total"],
		order_by="creation asc",
	)
	sale_names = [sale.name for sale in sales]
	rows_by_key = {}
	payment_totals = {}

	for sale in sales:
		if sale.transaction_type == "Sale":
			payment_totals[sale.mode_of_payment] = payment_totals.get(sale.mode_of_payment, 0) + flt(sale.grand_total)

	for item in frappe.get_all(
		"CMAT POS Sale Item",
		filters={"parent": ["in", sale_names]} if sale_names else {"name": "__never__"},
		fields=["parent", "item_code", "item_name", "qty", "uom", "amount"],
	):
		parent = next((sale for sale in sales if sale.name == item.parent), None)
		if not parent:
			continue
		row = get_summary_row(rows_by_key, item.item_code, item.uom)
		row["item_name"] = item.item_name or row["item_name"]
		if parent.transaction_type == "Sale":
			row["sold_qty"] += flt(item.qty)
			row["revenue"] += flt(item.amount)
		elif parent.transaction_type == "Staff Use":
			row["staff_use_qty"] += flt(item.qty)
		elif parent.transaction_type == "Sample":
			row["sample_qty"] += flt(item.qty)
		elif parent.transaction_type == "Loss":
			row["loss_qty"] += flt(item.qty)

	add_stock_movement_summary(rows_by_key, profile.warehouse, start_datetime, end_datetime)

	rows = list(rows_by_key.values())
	rows.sort(key=lambda row: (row["item_name"] or row["item_code"], row["uom"] or ""))

	total_sales = sum(flt(row["revenue"]) for row in rows)
	return {
		"company": profile.company,
		"pos_profile": pos_profile,
		"warehouse": profile.warehouse,
		"opening_entry": opening_entry,
		"invoice": invoice,
		"letter_head": get_default_letter_head_content(),
		"from_datetime": start_datetime,
		"to_datetime": end_datetime,
		"rows": rows,
		"payment_totals": [{"mode_of_payment": mode, "amount": amount} for mode, amount in payment_totals.items()],
		"deposit_record": deposit.name if deposit else None,
		"cash_deposited": flt(deposit.cash_deposited) if deposit else 0,
		"mobile_money_amount": flt(deposit.mobile_money_amount) if deposit else 0,
		"total_declared": flt(deposit.total_declared) if deposit else 0,
		"shortage": flt(deposit.shortage) if deposit else total_sales,
		"total_sales": total_sales,
		"total_qty_sold": sum(flt(row["sold_qty"]) for row in rows),
		"total_staff_use": sum(flt(row["staff_use_qty"]) for row in rows),
		"total_sample": sum(flt(row["sample_qty"]) for row in rows),
		"total_loss": sum(flt(row["loss_qty"]) for row in rows),
		"has_activity": bool(sales or rows or deposit),
	}


def save_sales_day_deposit(
	pos_profile,
	opening_entry,
	cash_deposited=0,
	mobile_money_amount=0,
	expected_sales=0,
	sales_invoice=None,
):
	profile = frappe.get_cached_doc("POS Profile", pos_profile)
	deposit_name = frappe.db.exists("CMAT Sales Day Deposit", {"opening_entry": opening_entry})
	deposit = (
		frappe.get_doc("CMAT Sales Day Deposit", deposit_name)
		if deposit_name
		else frappe.new_doc("CMAT Sales Day Deposit")
	)
	if (
		not deposit.is_new()
		and not flt(cash_deposited)
		and not flt(mobile_money_amount)
		and flt(deposit.total_declared)
	):
		cash_deposited = deposit.cash_deposited
		mobile_money_amount = deposit.mobile_money_amount

	deposit.pos_profile = pos_profile
	deposit.opening_entry = opening_entry
	deposit.company = profile.company
	deposit.user = frappe.session.user
	deposit.posting_date = today()
	deposit.expected_sales = flt(expected_sales)
	deposit.cash_deposited = flt(cash_deposited)
	deposit.mobile_money_amount = flt(mobile_money_amount)
	if sales_invoice:
		deposit.sales_invoice = sales_invoice

	if deposit.is_new():
		deposit.insert(ignore_permissions=True)
	else:
		deposit.save(ignore_permissions=True)
	return deposit


def get_sales_day_deposit(opening_entry):
	if not opening_entry:
		return None
	deposit_name = frappe.db.exists("CMAT Sales Day Deposit", {"opening_entry": opening_entry})
	return frappe.get_doc("CMAT Sales Day Deposit", deposit_name) if deposit_name else None


def get_default_letter_head_content():
	letter_head = frappe.db.get_value("Letter Head", {"is_default": 1, "disabled": 0}, "name")
	if not letter_head:
		return ""
	return frappe.db.get_value("Letter Head", letter_head, "content") or ""


def get_summary_row(rows_by_key, item_code, uom=None):
	uom = uom or frappe.get_cached_value("Item", item_code, "stock_uom") or ""
	key = (item_code, uom)
	if key not in rows_by_key:
		rows_by_key[key] = {
			"item_code": item_code,
			"item_name": frappe.get_cached_value("Item", item_code, "item_name") or item_code,
			"uom": uom,
			"opening_stock": 0,
			"additional_stock": 0,
			"sold_qty": 0,
			"staff_use_qty": 0,
			"sample_qty": 0,
			"loss_qty": 0,
			"closing_stock": 0,
			"revenue": 0,
		}
	return rows_by_key[key]


def add_stock_movement_summary(rows_by_key, warehouse, start_datetime, end_datetime):
	if not warehouse:
		return

	item_codes = set(item_code for item_code, _uom in rows_by_key)
	for row in frappe.get_all(
		"Stock Ledger Entry",
		filters={
			"warehouse": warehouse,
			"posting_datetime": ["between", [start_datetime, end_datetime]],
			"is_cancelled": 0,
		},
		fields=["item_code", "actual_qty", "stock_uom"],
	):
		item_codes.add(row.item_code)
		summary = get_summary_row(rows_by_key, row.item_code, row.stock_uom)
		if flt(row.actual_qty) > 0:
			summary["additional_stock"] += flt(row.actual_qty)

	for item_code in item_codes:
		stock_uom = frappe.get_cached_value("Item", item_code, "stock_uom")
		summary = get_summary_row(rows_by_key, item_code, stock_uom)
		closing_stock = flt(frappe.db.get_value("Bin", {"item_code": item_code, "warehouse": warehouse}, "actual_qty"))
		net_movement = flt(
			frappe.db.sql(
				"""
				select sum(actual_qty)
				from `tabStock Ledger Entry`
				where item_code = %s
					and warehouse = %s
					and posting_datetime between %s and %s
					and is_cancelled = 0
				""",
				(item_code, warehouse, start_datetime, end_datetime),
			)[0][0]
		)
		summary["closing_stock"] = closing_stock
		summary["opening_stock"] = closing_stock - net_movement


def make_daily_sales_invoice(pos_profile, sales):
	profile = frappe.get_cached_doc("POS Profile", pos_profile)
	invoice = frappe.new_doc("Sales Invoice")
	invoice.is_pos = 1
	invoice.pos_profile = pos_profile
	invoice.company = profile.company
	invoice.customer = profile.customer
	invoice.posting_date = today()
	invoice.set_posting_time = 1
	invoice.update_stock = 1
	invoice.ignore_pricing_rule = 1
	invoice.additional_discount_percentage = 0
	invoice.discount_amount = 0
	invoice.apply_discount_on = ""
	invoice.set_warehouse = profile.warehouse
	invoice.remarks = _("Daily POS sales for {0} on {1}").format(pos_profile, today())

	item_totals = {}
	payment_totals = {}
	for sale in sales:
		payment_totals[sale.mode_of_payment] = payment_totals.get(sale.mode_of_payment, 0) + flt(sale.grand_total)
		for item in frappe.get_all(
			"CMAT POS Sale Item",
			filters={"parent": sale.name},
			fields=["item_code", "qty", "uom", "rate"],
		):
			key = (item.item_code, item.uom, flt(item.rate))
			if key not in item_totals:
				item_totals[key] = {"item_code": item.item_code, "uom": item.uom, "rate": flt(item.rate), "qty": 0}
			item_totals[key]["qty"] += flt(item.qty)

	for item in item_totals.values():
		invoice.append(
			"items",
			{
				"item_code": item["item_code"],
				"qty": item["qty"],
				"uom": item["uom"],
				"rate": item["rate"],
				"price_list_rate": item["rate"],
				"discount_percentage": 0,
				"discount_amount": 0,
			},
		)

	invoice.set_missing_values()
	invoice.calculate_taxes_and_totals()
	invoice.set("payments", [])

	payment_rows = list(payment_totals.items())
	target_total = flt(invoice.rounded_total or invoice.grand_total)
	for index, (mode_of_payment, amount) in enumerate(payment_rows):
		if index == len(payment_rows) - 1:
			amount = target_total - sum(flt(payment.amount) for payment in invoice.payments)
		invoice.append(
			"payments",
			{
				"mode_of_payment": mode_of_payment,
				"account": get_safe_payment_account(mode_of_payment, profile.company, profile),
				"amount": amount,
				"default": 1 if index == 0 else 0,
			},
		)

	invoice.paid_amount = target_total
	invoice.base_paid_amount = flt(invoice.base_rounded_total or invoice.base_grand_total)
	invoice.insert(ignore_permissions=True)
	invoice.submit()
	return invoice


def make_stock_use_entry(pos_profile, sale):
	profile = frappe.get_cached_doc("POS Profile", pos_profile)
	if not profile.warehouse:
		frappe.throw(_("POS Profile {0} has no warehouse.").format(pos_profile))

	stock_entry = frappe.new_doc("Stock Entry")
	stock_entry.company = profile.company
	stock_entry.stock_entry_type = "Material Issue"
	stock_entry.purpose = "Material Issue"
	stock_entry.posting_date = today()
	stock_entry.set_posting_time = 1
	stock_entry.remarks = _("{0} recorded from CMAT POS {1}").format(sale.transaction_type, sale.name)

	for item in sale.items:
		if not frappe.get_cached_value("Item", item.item_code, "is_stock_item"):
			continue
		stock_entry.append(
			"items",
			{
				"item_code": item.item_code,
				"s_warehouse": profile.warehouse,
				"qty": item.qty,
				"uom": item.uom,
			},
		)

	if not stock_entry.items:
		return None

	stock_entry.insert(ignore_permissions=True)
	stock_entry.submit()
	return stock_entry.name


def get_safe_payment_account(mode_of_payment, company, profile=None):
	accounts = []

	if profile:
		for payment in profile.payments:
			if payment.mode_of_payment == mode_of_payment:
				account = getattr(payment, "account", None)
				if account:
					accounts.append(account)

	accounts.extend(
		frappe.get_all(
			"Mode of Payment Account",
			filters={"parent": mode_of_payment, "company": company},
			pluck="default_account",
		)
	)

	for account in accounts:
		if is_safe_payment_account(account, company):
			return account

	fallback = get_fallback_payment_account(mode_of_payment, company)
	if fallback:
		return fallback

	frappe.throw(
		_(
			"Payment account setup is missing for {0}. Ask the manager to set a Cash, Mobile Money, or Bank account."
		).format(mode_of_payment),
		title=_("Payment Setup Needed"),
	)


def is_safe_payment_account(account, company):
	if not account:
		return False

	details = frappe.db.get_value(
		"Account",
		account,
		["company", "is_group", "account_type", "root_type"],
		as_dict=True,
	)
	if not details or details.company != company or details.is_group:
		return False

	return details.root_type == "Asset" and details.account_type not in {"Receivable", "Payable"}


def get_fallback_payment_account(mode_of_payment, company):
	mode = (mode_of_payment or "").lower()
	preferred_types = ["Cash"] if "cash" in mode else ["Bank"] if "bank" in mode or "mobile" in mode else ["Cash", "Bank"]

	for account_type in preferred_types + ["Cash", "Bank"]:
		account = frappe.db.get_value(
			"Account",
			{
				"company": company,
				"is_group": 0,
				"disabled": 0,
				"account_type": account_type,
			},
			"name",
		)
		if account and is_safe_payment_account(account, company):
			return account

	return None


def is_payment_account_error(exc):
	message = str(exc)
	return "Customer is required against Receivable account" in message or "against Receivable account" in message


def get_print_url(invoice):
	print_format = None
	no_letterhead = 0
	if invoice.doctype == "CMAT POS Sale":
		print_format = "CMAT Thermal POS Receipt"
		no_letterhead = 1
	elif invoice.doctype == "Sales Invoice":
		print_format = frappe.db.get_value("POS Profile", invoice.pos_profile, "print_format")
		if not print_format and frappe.db.exists("Print Format", "Sales Invoice"):
			print_format = "Sales Invoice"

	return "/printview?" + urlencode(
		{
			"doctype": invoice.doctype,
			"name": invoice.name,
			"format": print_format or "Standard",
			"no_letterhead": no_letterhead,
			"settings": "{}",
		}
	)


@frappe.whitelist()
def get_receipt_print_url(doctype, name):
	if doctype not in {"CMAT POS Sale", "Sales Invoice"}:
		frappe.throw(_("Cannot print receipt for {0}.").format(doctype))
	if not name:
		frappe.throw(_("Receipt name is required."))

	doc = frappe.get_doc(doctype, name)
	if not frappe.has_permission(doc.doctype, "read", doc=doc):
		frappe.throw(_("Not permitted to print this receipt."))
	return {"print_url": get_print_url(doc)}


def get_user_pos_profiles():
	company = frappe.defaults.get_user_default("company") or frappe.defaults.get_global_default("company")
	filters = {"disabled": 0}
	if company:
		filters["company"] = company

	all_profiles = frappe.get_all(
		"POS Profile",
		filters=filters,
		fields=["name", "company", "warehouse", "customer"],
		order_by="name asc",
	)

	allowed = []
	for profile in all_profiles:
		users = frappe.get_all(
			"POS Profile User",
			filters={"parent": profile.name},
			fields=["user", "default"],
		)
		if not users or any(row.user == frappe.session.user for row in users):
			profile["is_default"] = any(row.user == frappe.session.user and row.default for row in users)
			allowed.append(profile)

	return allowed


def get_default_profile(profiles):
	for profile in profiles:
		if profile.get("is_default"):
			return profile.name

	return profiles[0].name if profiles else None


def get_opening_entry(pos_profile):
	filters = {"user": frappe.session.user, "status": "Open", "docstatus": 1}
	if pos_profile:
		filters["pos_profile"] = pos_profile

	return frappe.db.get_value("POS Opening Entry", filters, "name")


@frappe.whitelist()
def get_payment_modes(profile):
	if not profile:
		return []

	return get_payment_modes_for_profile(profile)


def get_payment_modes_for_profile(profile):
	if not profile:
		return []

	doc = frappe.get_cached_doc("POS Profile", profile)
	return [
		{
			"mode_of_payment": payment.mode_of_payment,
			"default": payment.default,
		}
		for payment in doc.payments
	]


def get_litres_sold(sale_names):
	if not sale_names:
		return 0

	items = frappe.get_all(
		"CMAT POS Sale Item",
		filters={"parent": ["in", sale_names]},
		fields=["qty", "uom"],
	)
	return sum(flt(item.qty) for item in items if is_litre_uom(item.uom))


def is_litre_uom(uom):
	return (uom or "").strip().lower() in {"litre", "liter", "l"}


def get_usage_qty(pos_profile, transaction_type):
	sale_names = frappe.get_all(
		"CMAT POS Sale",
		filters={
			"docstatus": 1,
			"posting_date": getdate(today()),
			"pos_profile": pos_profile,
			"transaction_type": transaction_type,
		},
		pluck="name",
	)
	return get_litres_sold(sale_names)


def empty_dashboard():
	return {
		"today_sales": 0,
		"litres_sold": 0,
		"bought_today": 0,
		"staff_use_qty": 0,
		"sample_qty": 0,
		"loss_qty": 0,
	}
