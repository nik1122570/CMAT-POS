import frappe
from frappe import _
from frappe.utils import flt, getdate, today


def execute(filters=None):
	filters = frappe._dict(filters or {})
	validate_filters(filters)
	columns = get_columns()
	data = get_data(filters)
	summary = get_report_summary(data)
	return columns, data, None, None, summary


def validate_filters(filters):
	if not filters.from_date:
		filters.from_date = getdate(today()).replace(day=1)
	if not filters.to_date:
		filters.to_date = today()
	if getdate(filters.from_date) > getdate(filters.to_date):
		frappe.throw(_("From Date cannot be after To Date."))


def get_columns():
	return [
		{"label": _("Date"), "fieldname": "posting_date", "fieldtype": "Date", "width": 105},
		{"label": _("Shop / POS Profile"), "fieldname": "pos_profile", "fieldtype": "Link", "options": "POS Profile", "width": 180},
		{"label": _("Cost Center"), "fieldname": "cost_center", "fieldtype": "Link", "options": "Cost Center", "width": 170},
		{"label": _("Warehouse"), "fieldname": "warehouse", "fieldtype": "Link", "options": "Warehouse", "width": 170},
		{"label": _("Cashier"), "fieldname": "cashier", "fieldtype": "Link", "options": "User", "width": 150},
		{"label": _("Sales Count"), "fieldname": "sales_count", "fieldtype": "Int", "width": 105},
		{"label": _("Total Revenue"), "fieldname": "total_revenue", "fieldtype": "Currency", "width": 135},
		{"label": _("Cash Sales"), "fieldname": "cash_sales", "fieldtype": "Currency", "width": 125},
		{"label": _("Mobile Money Sales"), "fieldname": "mobile_money_sales", "fieldtype": "Currency", "width": 155},
		{"label": _("Bank Sales"), "fieldname": "bank_sales", "fieldtype": "Currency", "width": 125},
		{"label": _("Cash Deposited"), "fieldname": "cash_deposited", "fieldtype": "Currency", "width": 140},
		{"label": _("Mobile Money Declared"), "fieldname": "mobile_money_declared", "fieldtype": "Currency", "width": 170},
		{"label": _("Total Declared"), "fieldname": "total_declared", "fieldtype": "Currency", "width": 135},
		{"label": _("Shortage"), "fieldname": "shortage", "fieldtype": "Currency", "width": 120},
		{"label": _("Litres Sold"), "fieldname": "litres_sold", "fieldtype": "Float", "precision": 2, "width": 115},
		{"label": _("Staff Use"), "fieldname": "staff_use_qty", "fieldtype": "Float", "precision": 2, "width": 105},
		{"label": _("Sample"), "fieldname": "sample_qty", "fieldtype": "Float", "precision": 2, "width": 95},
		{"label": _("Loss"), "fieldname": "loss_qty", "fieldtype": "Float", "precision": 2, "width": 85},
		{"label": _("Opening Entry"), "fieldname": "opening_entry", "fieldtype": "Link", "options": "POS Opening Entry", "width": 175},
		{"label": _("Sales Invoice"), "fieldname": "sales_invoice", "fieldtype": "Link", "options": "Sales Invoice", "width": 175},
	]


def get_data(filters):
	conditions = ["sale.docstatus = 1", "sale.posting_date between %(from_date)s and %(to_date)s"]
	if filters.pos_profile:
		conditions.append("sale.pos_profile = %(pos_profile)s")
	if filters.cashier:
		conditions.append("sale.user = %(cashier)s")
	if filters.cost_center:
		conditions.append("coalesce(profile.cost_center, '') = %(cost_center)s")

	where_clause = " and ".join(conditions)
	return frappe.db.sql(
		f"""
		select
			sales.posting_date,
			sales.pos_profile,
			coalesce(profile.cost_center, '') as cost_center,
			coalesce(profile.warehouse, '') as warehouse,
			sales.cashier,
			sales.opening_entry,
			sales.sales_invoice,
			sales.sales_count,
			sales.total_revenue,
			sales.cash_sales,
			sales.mobile_money_sales,
			sales.bank_sales,
			coalesce(items.litres_sold, 0) as litres_sold,
			coalesce(items.staff_use_qty, 0) as staff_use_qty,
			coalesce(items.sample_qty, 0) as sample_qty,
			coalesce(items.loss_qty, 0) as loss_qty,
			coalesce(deposit.cash_deposited, 0) as cash_deposited,
			coalesce(deposit.mobile_money_amount, 0) as mobile_money_declared,
			coalesce(deposit.total_declared, 0) as total_declared,
			coalesce(deposit.shortage, sales.total_revenue) as shortage
		from (
			select
				sale.posting_date,
				sale.pos_profile,
				sale.user as cashier,
				sale.opening_entry,
				max(sale.sales_invoice) as sales_invoice,
				sum(case when sale.transaction_type = 'Sale' then 1 else 0 end) as sales_count,
				sum(case when sale.transaction_type = 'Sale' then sale.grand_total else 0 end) as total_revenue,
				sum(
					case
						when sale.transaction_type = 'Sale'
						and lower(coalesce(sale.mode_of_payment, '')) like '%%cash%%'
						then sale.grand_total else 0
					end
				) as cash_sales,
				sum(
					case
						when sale.transaction_type = 'Sale'
						and (
							lower(coalesce(sale.mode_of_payment, '')) like '%%mobile%%'
							or lower(coalesce(sale.mode_of_payment, '')) like '%%m-pesa%%'
							or lower(coalesce(sale.mode_of_payment, '')) like '%%mpesa%%'
							or lower(coalesce(sale.mode_of_payment, '')) like '%%tigo%%'
							or lower(coalesce(sale.mode_of_payment, '')) like '%%airtel%%'
						)
						then sale.grand_total else 0
					end
				) as mobile_money_sales,
				sum(
					case
						when sale.transaction_type = 'Sale'
						and lower(coalesce(sale.mode_of_payment, '')) like '%%bank%%'
						then sale.grand_total else 0
					end
				) as bank_sales
			from `tabCMAT POS Sale` sale
			left join `tabPOS Profile` profile on profile.name = sale.pos_profile
			where {where_clause}
			group by sale.posting_date, sale.pos_profile, sale.user, sale.opening_entry
		) sales
		left join (
			select
				sale.opening_entry,
				sum(case when sale.transaction_type = 'Sale' and item.uom in ('Litre', 'Liter', 'L') then item.qty else 0 end) as litres_sold,
				sum(case when sale.transaction_type = 'Staff Use' and item.uom in ('Litre', 'Liter', 'L') then item.qty else 0 end) as staff_use_qty,
				sum(case when sale.transaction_type = 'Sample' and item.uom in ('Litre', 'Liter', 'L') then item.qty else 0 end) as sample_qty,
				sum(case when sale.transaction_type = 'Loss' and item.uom in ('Litre', 'Liter', 'L') then item.qty else 0 end) as loss_qty
			from `tabCMAT POS Sale` sale
			left join `tabCMAT POS Sale Item` item on item.parent = sale.name
			left join `tabPOS Profile` profile on profile.name = sale.pos_profile
			where {where_clause}
			group by sale.opening_entry
		) items on items.opening_entry = sales.opening_entry
		left join `tabPOS Profile` profile on profile.name = sales.pos_profile
		left join `tabCMAT Sales Day Deposit` deposit on deposit.opening_entry = sales.opening_entry
		order by sales.posting_date desc, sales.pos_profile asc
		""",
		filters,
		as_dict=True,
	)


def get_report_summary(data):
	total_revenue = sum(flt(row.total_revenue) for row in data)
	total_declared = sum(flt(row.total_declared) for row in data)
	shortage = sum(flt(row.shortage) for row in data)
	litres_sold = sum(flt(row.litres_sold) for row in data)
	best_shop = get_best_shop(data)

	return [
		{"value": total_revenue, "label": _("Total Revenue"), "datatype": "Currency", "indicator": "Green"},
		{"value": total_declared, "label": _("Total Declared"), "datatype": "Currency", "indicator": "Blue"},
		{"value": shortage, "label": _("Shortage"), "datatype": "Currency", "indicator": "Red" if shortage else "Green"},
		{"value": litres_sold, "label": _("Litres Sold"), "datatype": "Float", "indicator": "Green"},
		{"value": best_shop, "label": _("Best Shop"), "datatype": "Data", "indicator": "Blue"},
	]


def get_best_shop(data):
	shop_totals = {}
	for row in data:
		shop_totals[row.pos_profile] = shop_totals.get(row.pos_profile, 0) + flt(row.total_revenue)
	if not shop_totals:
		return ""
	return max(shop_totals, key=shop_totals.get)
