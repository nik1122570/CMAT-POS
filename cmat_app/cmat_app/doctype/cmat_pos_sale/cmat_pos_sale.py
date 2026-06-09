import frappe
from frappe.model.document import Document
from frappe.utils import flt


class CMATPOSSale(Document):
	def validate(self):
		self.total_qty = 0
		self.grand_total = 0
		for item in self.items:
			if self.transaction_type != "Sale":
				item.rate = 0
			item.amount = flt(item.qty) * flt(item.rate)
			self.total_qty += flt(item.qty)
			self.grand_total += flt(item.amount)

		if self.transaction_type == "Sale" and not self.mode_of_payment:
			frappe.throw("Please select payment mode before checkout.")
		if self.transaction_type != "Sale":
			self.mode_of_payment = None

	def before_submit(self):
		if not self.items:
			frappe.throw("Please add at least one item.")

	def on_submit(self):
		self.db_set("status", "Completed", update_modified=False)
