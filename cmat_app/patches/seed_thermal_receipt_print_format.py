import frappe


PRINT_FORMAT_NAME = "CMAT Thermal POS Receipt"


def execute():
	html = get_receipt_html()
	css = get_receipt_css()

	if frappe.db.exists("Print Format", PRINT_FORMAT_NAME):
		print_format = frappe.get_doc("Print Format", PRINT_FORMAT_NAME)
		print_format.html = html
		print_format.css = css
		print_format.print_format_type = "Jinja"
		print_format.custom_format = 1
		print_format.disabled = 0
		print_format.save(ignore_permissions=True)
	else:
		print_format = frappe.get_doc(
			{
				"doctype": "Print Format",
				"name": PRINT_FORMAT_NAME,
				"doc_type": "CMAT POS Sale",
				"module": "CMAT App",
				"print_format_type": "Jinja",
				"custom_format": 1,
				"standard": "No",
				"disabled": 0,
				"html": html,
				"css": css,
			}
		)
		print_format.insert(ignore_permissions=True)


def get_receipt_html():
	return """
{% set letter_head_name = frappe.db.get_value("Letter Head", {"is_default": 1, "disabled": 0}, "name") %}
{% set letter_head_content = frappe.db.get_value("Letter Head", letter_head_name, "content") if letter_head_name else "" %}
<div class="cmat-receipt">
	<div class="receipt-head">
		{% if letter_head_content %}
		<div class="system-letter-head">{{ letter_head_content }}</div>
		{% else %}
		<div class="company">CMAT GROUP LTD</div>
		{% endif %}
		<div class="tagline">Dairy Shop Receipt</div>
	</div>

	<div class="rule"></div>

	<table class="meta">
		<tr>
			<td>POS ID</td>
			<td>{{ doc.name }}</td>
		</tr>
		<tr>
			<td>Shop</td>
			<td>{{ doc.pos_profile }}</td>
		</tr>
		<tr>
			<td>Date</td>
			<td>{{ frappe.utils.formatdate(doc.posting_date) }} {{ doc.posting_time or "" }}</td>
		</tr>
		<tr>
			<td>Cashier</td>
			<td>{{ frappe.db.get_value("User", doc.user, "full_name") or doc.user }}</td>
		</tr>
		<tr>
			<td>Type</td>
			<td>{{ doc.transaction_type or "Sale" }}</td>
		</tr>
		{% if doc.mode_of_payment %}
		<tr>
			<td>Paid By</td>
			<td>{{ doc.mode_of_payment }}</td>
		</tr>
		{% endif %}
	</table>

	<div class="rule"></div>

	<table class="items">
		<thead>
			<tr>
				<th>Item</th>
				<th class="qty">Qty</th>
				<th class="amt">Amount</th>
			</tr>
		</thead>
		<tbody>
			{% for item in doc.items %}
			<tr>
				<td>
					<strong>{{ item.item_name or item.item_code }}</strong>
					<span>{{ item.uom }}</span>
				</td>
				<td class="qty">{{ frappe.utils.flt(item.qty, 2) }}</td>
				<td class="amt">{{ frappe.utils.fmt_money(item.amount, currency=doc.currency or frappe.db.get_value("Company", doc.company, "default_currency")) }}</td>
			</tr>
			{% endfor %}
		</tbody>
	</table>

	<div class="rule"></div>

	<table class="total">
		<tr>
			<td>Total Qty</td>
			<td>{{ frappe.utils.flt(doc.total_qty, 2) }}</td>
		</tr>
		<tr>
			<td>Total Amount</td>
			<td>{{ frappe.utils.fmt_money(doc.grand_total, currency=doc.currency or frappe.db.get_value("Company", doc.company, "default_currency")) }}</td>
		</tr>
	</table>

	<div class="foot">
		<div>Thank you for choosing CMAT.</div>
		<div>{{ frappe.utils.now_datetime().strftime("%d-%m-%Y %H:%M") }}</div>
	</div>
</div>
"""


def get_receipt_css():
	return """
@page {
	size: 80mm auto;
	margin: 3mm;
}

html,
body {
	margin: 0 !important;
	padding: 0 !important;
	background: #fff !important;
}

.print-format {
	margin: 0 auto !important;
	padding: 0 !important;
	width: 72mm !important;
	max-width: 72mm !important;
	min-height: auto !important;
	font-family: Arial, Helvetica, sans-serif !important;
	color: #111 !important;
	float: none !important;
	position: relative !important;
}

.cmat-receipt {
	width: 72mm;
	max-width: 72mm;
	margin: 0 auto !important;
	padding: 0 1mm;
	font-size: 11px;
	line-height: 1.28;
	text-align: left;
}

.receipt-head {
	text-align: center;
}

.system-letter-head {
	max-width: 66mm;
	margin: 0 auto 1mm;
	text-align: center;
	overflow: hidden;
}

.system-letter-head * {
	max-width: 66mm !important;
	margin-left: auto !important;
	margin-right: auto !important;
	text-align: center !important;
}

.system-letter-head img {
	max-width: 48mm !important;
	max-height: 18mm !important;
	object-fit: contain !important;
	display: block !important;
}

.company {
	font-size: 13px;
	font-weight: 800;
	letter-spacing: 0;
}

.tagline,
.foot {
	font-size: 10px;
	color: #333;
}

.rule {
	border-top: 1px dashed #111;
	margin: 2.5mm 0;
}

table {
	width: 100%;
	border-collapse: collapse;
}

.meta td {
	padding: 0.7mm 0;
	vertical-align: top;
}

.meta td:first-child {
	width: 18mm;
	font-weight: 700;
}

.meta td:last-child {
	text-align: right;
	word-break: break-word;
}

.items th {
	font-size: 10px;
	text-align: left;
	border-bottom: 1px solid #111;
	padding-bottom: 1mm;
}

.items td {
	padding: 1.2mm 0;
	vertical-align: top;
	border-bottom: 1px dotted #bbb;
}

.items strong,
.items span {
	display: block;
	word-break: break-word;
}

.items span {
	font-size: 9px;
	color: #444;
}

.qty {
	width: 11mm;
	text-align: center !important;
}

.amt {
	width: 22mm;
	text-align: right !important;
}

.total td {
	padding: 1mm 0;
	font-size: 12px;
	font-weight: 800;
}

.total td:last-child {
	text-align: right;
}

.foot {
	text-align: center;
	margin-top: 3mm;
}
"""
