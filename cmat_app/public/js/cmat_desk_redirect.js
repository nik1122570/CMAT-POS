(function () {
	function should_redirect() {
		if (!window.frappe || !frappe.user_roles) {
			return false;
		}

		if (!frappe.user_roles.includes("Sales Personel")) {
			return false;
		}

		if (frappe.user_roles.includes("System Manager")) {
			return false;
		}

		const route_str = frappe.get_route_str ? frappe.get_route_str() : "";

		return route_str !== "cmat-pos";
	}

	function redirect_sales_personel_home() {
		if (should_redirect()) {
			frappe.set_route("cmat-pos");
		}
	}

	frappe.ready(() => {
		setTimeout(redirect_sales_personel_home, 300);
		if (frappe.router && frappe.router.on) {
			frappe.router.on("change", () => {
				setTimeout(redirect_sales_personel_home, 50);
			});
		}
	});
})();
