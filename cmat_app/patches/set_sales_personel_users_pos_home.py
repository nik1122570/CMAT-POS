import frappe


def execute():
	if frappe.db.exists("Role", "Sales Personel"):
		frappe.db.set_value("Role", "Sales Personel", "home_page", "app/cmat-pos")

	users = frappe.get_all(
		"Has Role",
		filters={"role": "Sales Personel", "parenttype": "User"},
		pluck="parent",
	)
	for user in users:
		if user in {"Administrator", "Guest"}:
			continue
		if frappe.db.exists("User", user):
			frappe.db.set_value("User", user, "home_page", "app/cmat-pos")
