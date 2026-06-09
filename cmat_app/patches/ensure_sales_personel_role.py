import frappe


def execute():
	if not frappe.db.exists("Role", "Sales Personel"):
		frappe.get_doc(
			{
				"doctype": "Role",
				"role_name": "Sales Personel",
				"home_page": "app/cmat-pos",
				"desk_access": 1,
				"disabled": 0,
			}
		).insert(ignore_permissions=True)
	else:
		frappe.db.set_value("Role", "Sales Personel", "home_page", "app/cmat-pos")
