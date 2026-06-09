import frappe


def execute():
	if frappe.db.exists("Role", "Sales Personel"):
		frappe.db.set_value("Role", "Sales Personel", "home_page", "app/cmat-pos")
