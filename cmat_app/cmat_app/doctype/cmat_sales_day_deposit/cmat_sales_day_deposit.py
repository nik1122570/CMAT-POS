import frappe
from frappe.model.document import Document
from frappe.utils import flt


class CMATSalesDayDeposit(Document):
	def validate(self):
		self.cash_deposited = flt(self.cash_deposited)
		self.mobile_money_amount = flt(self.mobile_money_amount)
		self.expected_sales = flt(self.expected_sales)
		self.total_declared = self.cash_deposited + self.mobile_money_amount
		self.shortage = self.expected_sales - self.total_declared

		if self.total_declared > self.expected_sales:
			frappe.throw(
				"Declared money cannot be more than the system sales total.",
				title="Amount Too High",
			)
