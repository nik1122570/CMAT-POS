frappe.pages["cmat-sales-day"].on_page_load = function (wrapper) {
	cmat_app.ensure_sales_day_styles();

	frappe.ui.make_app_page({
		parent: wrapper,
		title: __("CMAT Sales Day"),
		single_column: true,
	});

	wrapper.cmat_sales_day = new cmat_app.SalesDay(wrapper);
};

frappe.provide("cmat_app");

cmat_app.ensure_sales_day_styles = function () {
	if (document.getElementById("cmat-sales-day-inline-styles")) return;

	const style = document.createElement("style");
	style.id = "cmat-sales-day-inline-styles";
	style.textContent = `
		.page-cmat-sales-day .page-head,
		.page-cmat-sales-day .page-title,
		.page-cmat-sales-day .page-actions {
			display: none !important;
		}

		.page-cmat-sales-day .layout-main,
		.page-cmat-sales-day .layout-main-section-wrapper,
		.page-cmat-sales-day .layout-main-section {
			width: 100% !important;
			max-width: none !important;
			margin: 0 !important;
			padding: 0 !important;
		}

		.cmat-welcome {
			min-height: calc(100vh - 52px) !important;
			display: grid !important;
			grid-template-columns: minmax(0, 1fr) 390px !important;
			gap: 18px !important;
			padding: 22px !important;
			background:
				radial-gradient(circle at 18% 18%, rgba(229, 28, 47, 0.12), transparent 26%),
				radial-gradient(circle at 88% 8%, rgba(32, 117, 76, 0.18), transparent 26%),
				linear-gradient(135deg, #fff8ef, #eef7f1 54%, #f7f7f5) !important;
			color: #161817 !important;
		}

		.cmat-welcome * {
			box-sizing: border-box !important;
			letter-spacing: 0 !important;
		}

		.cmat-welcome-main {
			min-height: calc(100vh - 96px) !important;
			display: grid !important;
			grid-template-rows: auto 1fr auto !important;
			gap: 16px !important;
			border: 1px solid rgba(30, 34, 32, 0.08) !important;
			border-radius: 8px !important;
			background: rgba(255, 255, 255, 0.9) !important;
			box-shadow: 0 24px 70px rgba(30, 34, 32, 0.11) !important;
			overflow: hidden !important;
			position: relative !important;
		}

		.cmat-welcome-main:before {
			content: "" !important;
			position: absolute !important;
			inset: 0 !important;
			background:
				linear-gradient(90deg, rgba(255,255,255,0.96), rgba(255,255,255,0.72)),
				radial-gradient(circle at 82% 24%, rgba(229, 28, 47, 0.18), transparent 18%),
				radial-gradient(circle at 86% 72%, rgba(32, 117, 76, 0.18), transparent 24%) !important;
			pointer-events: none !important;
		}

		.cmat-welcome-brand,
		.cmat-welcome-hero,
		.cmat-welcome-footer {
			position: relative !important;
			z-index: 1 !important;
		}

		.cmat-welcome-brand {
			display: flex !important;
			align-items: center !important;
			justify-content: space-between !important;
			gap: 16px !important;
			padding: 24px 28px 0 !important;
		}

		.cmat-welcome-logo {
			width: min(330px, 46vw) !important;
			height: auto !important;
			display: block !important;
			filter: drop-shadow(0 12px 26px rgba(0,0,0,0.08)) !important;
		}

		.cmat-welcome-date {
			min-width: 170px !important;
			text-align: right !important;
			color: #5e6662 !important;
			font-size: 13px !important;
			font-weight: 850 !important;
			text-transform: uppercase !important;
		}

		.cmat-welcome-hero {
			display: grid !important;
			align-content: center !important;
			gap: 22px !important;
			padding: 20px 28px 18px !important;
		}

		.cmat-welcome-eyebrow {
			width: fit-content !important;
			margin: 0 !important;
			border-radius: 999px !important;
			padding: 8px 14px !important;
			background: #fce7e9 !important;
			color: #c51628 !important;
			font-size: 12px !important;
			font-weight: 950 !important;
			text-transform: uppercase !important;
		}

		.cmat-welcome-title {
			max-width: 780px !important;
			margin: 0 !important;
			color: #121514 !important;
			font-size: clamp(54px, 7vw, 104px) !important;
			font-weight: 950 !important;
			line-height: 0.92 !important;
		}

		.cmat-welcome-copy {
			max-width: 650px !important;
			margin: 0 !important;
			color: #4e5853 !important;
			font-size: 19px !important;
			font-weight: 700 !important;
			line-height: 1.5 !important;
		}

		.cmat-welcome-actions {
			display: flex !important;
			flex-wrap: wrap !important;
			gap: 12px !important;
			align-items: center !important;
		}

		.cmat-welcome-button {
			min-height: 62px !important;
			border: 0 !important;
			border-radius: 8px !important;
			padding: 0 28px !important;
			background: #111111 !important;
			color: #ffffff !important;
			font-size: 18px !important;
			font-weight: 950 !important;
			cursor: pointer !important;
			box-shadow: 0 18px 36px rgba(0,0,0,0.22) !important;
		}

		.cmat-welcome-button:hover {
			transform: translateY(-1px) !important;
		}

		.cmat-welcome-button.secondary {
			border: 1px solid rgba(17,17,17,0.12) !important;
			background: #ffffff !important;
			color: #111111 !important;
			box-shadow: none !important;
		}

		.cmat-welcome-footer {
			display: grid !important;
			grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
			border-top: 1px solid rgba(30, 34, 32, 0.08) !important;
			background: rgba(255,255,255,0.72) !important;
		}

		.cmat-welcome-metric {
			display: grid !important;
			gap: 8px !important;
			padding: 20px 24px !important;
			border-right: 1px solid rgba(30, 34, 32, 0.08) !important;
		}

		.cmat-welcome-metric:last-child {
			border-right: 0 !important;
		}

		.cmat-welcome-metric span,
		.cmat-welcome-label {
			color: #6a716d !important;
			font-size: 12px !important;
			font-weight: 900 !important;
			text-transform: uppercase !important;
		}

		.cmat-welcome-metric strong {
			color: #0f6b49 !important;
			font-size: clamp(24px, 3vw, 36px) !important;
			font-weight: 950 !important;
			line-height: 1 !important;
		}

		.cmat-welcome-side {
			min-height: calc(100vh - 96px) !important;
			display: grid !important;
			grid-template-rows: auto 1fr auto !important;
			gap: 14px !important;
		}

		.cmat-welcome-card {
			border: 1px solid rgba(30, 34, 32, 0.08) !important;
			border-radius: 8px !important;
			background: rgba(255,255,255,0.94) !important;
			box-shadow: 0 18px 44px rgba(30, 34, 32, 0.09) !important;
			padding: 18px !important;
		}

		.cmat-welcome-shop {
			display: grid !important;
			gap: 10px !important;
		}

		.cmat-welcome-shop select {
			width: 100% !important;
			height: 52px !important;
			border: 1px solid rgba(30, 34, 32, 0.14) !important;
			border-radius: 8px !important;
			padding: 0 12px !important;
			background: #ffffff !important;
			color: #121514 !important;
			font-size: 16px !important;
			font-weight: 850 !important;
		}

		.cmat-welcome-status {
			display: grid !important;
			gap: 8px !important;
			margin-top: 10px !important;
			padding: 14px !important;
			border-radius: 8px !important;
			background: #f2f8f4 !important;
		}

		.cmat-welcome-status strong {
			color: #0f6b49 !important;
			font-size: 15px !important;
			overflow-wrap: anywhere !important;
		}

		.cmat-welcome-note {
			display: grid !important;
			align-content: center !important;
			gap: 10px !important;
			background:
				linear-gradient(145deg, rgba(17,17,17,0.92), rgba(41,49,45,0.92)),
				#111111 !important;
			color: #ffffff !important;
		}

		.cmat-welcome-note h3 {
			margin: 0 !important;
			color: #ffffff !important;
			font-size: 30px !important;
			font-weight: 950 !important;
		}

		.cmat-welcome-note p {
			margin: 0 !important;
			color: rgba(255,255,255,0.76) !important;
			font-size: 15px !important;
			font-weight: 700 !important;
			line-height: 1.5 !important;
		}

		.cmat-welcome-report {
			width: 100% !important;
			min-height: 54px !important;
			border: 1px solid rgba(30, 34, 32, 0.12) !important;
			border-radius: 8px !important;
			background: #ffffff !important;
			color: #121514 !important;
			font-size: 16px !important;
			font-weight: 900 !important;
			cursor: pointer !important;
		}

		@media (max-width: 1120px) {
			.cmat-welcome {
				grid-template-columns: 1fr !important;
			}

			.cmat-welcome-main,
			.cmat-welcome-side {
				min-height: auto !important;
			}
		}

		@media (max-width: 760px) {
			.cmat-welcome {
				padding: 10px !important;
			}

			.cmat-welcome-brand,
			.cmat-welcome-footer {
				grid-template-columns: 1fr !important;
			}

			.cmat-welcome-brand {
				display: grid !important;
			}

			.cmat-welcome-date {
				text-align: left !important;
			}
		}
	`;
	document.head.appendChild(style);
};

cmat_app.SalesDay = class {
	constructor(wrapper) {
		$(wrapper).addClass("page-cmat-sales-day");
		this.wrapper = $(wrapper).find(".layout-main-section");
		this.page = wrapper.page;
		this.context = {};
		this.make();
	}

	async make() {
		this.wrapper.html(`<div class="cmat-sales-day"></div>`);
		this.body = this.wrapper.find(".cmat-sales-day");
		await this.refresh();
	}

	async refresh(pos_profile) {
		const response = await frappe.call({
			method: "cmat_app.pos.get_sales_day_context",
			args: { pos_profile },
			freeze: true,
			freeze_message: __("Loading sales day"),
		});
		this.context = response.message || {};
		this.render();
	}

	render() {
		const profiles = this.context.profiles || [];
		const dashboard = this.context.dashboard || {};
		const selected = this.context.selected_profile || "";
		const opening = this.context.opening_entry;

		this.body.html(`
			<div class="cmat-welcome">
				<section class="cmat-welcome-main">
					<div class="cmat-welcome-brand">
						<img class="cmat-welcome-logo" src="/assets/cmat_app/images/cmat-logo.svg" alt="CMAT Group Limited">
						<div class="cmat-welcome-date">${frappe.datetime.str_to_user(frappe.datetime.get_today())}</div>
					</div>
					<div class="cmat-welcome-hero">
						<p class="cmat-welcome-eyebrow">${opening ? __("Shop is open") : __("Welcome back")}</p>
						<h1 class="cmat-welcome-title">${__("Ready for a fresh sales day")}</h1>
						<p class="cmat-welcome-copy">${__("Select the shop, open the counter, and serve customers with confidence.")}</p>
						<div class="cmat-welcome-actions">
							<button class="cmat-welcome-button" data-action="start">${opening ? __("Enter POS") : __("Start Sales Day")}</button>
							<button class="cmat-welcome-button secondary" data-action="report">${__("View Today Report")}</button>
						</div>
					</div>
					<div class="cmat-welcome-footer">
						${this.metric(__("Today Sales"), format_currency(dashboard.today_sales || 0))}
						${this.metric(__("Litres Sold"), `${flt(dashboard.litres_sold || 0, 2)} L`)}
						${this.metric(__("Sales Count"), flt(dashboard.bought_today || 0, 0))}
					</div>
				</section>

				<aside class="cmat-welcome-side">
					<section class="cmat-welcome-card cmat-welcome-shop">
						<label>
							<span class="cmat-welcome-label">${__("Choose Shop")}</span>
							<select data-field="profile">
								${profiles.map((profile) => `<option value="${frappe.utils.escape_html(profile.name)}" ${profile.name === selected ? "selected" : ""}>${frappe.utils.escape_html(profile.name)}</option>`).join("")}
							</select>
						</label>
						<div class="cmat-welcome-status">
							<span class="cmat-welcome-label">${__("Sales Day Status")}</span>
							<strong>${opening ? __("Open and ready") : __("Not started")}</strong>
						</div>
					</section>

					<section class="cmat-welcome-card cmat-welcome-note">
						<h3>${__("Fresh. Fast. Simple.")}</h3>
						<p>${__("The cashier starts here, then moves straight into the POS. No accounting distractions on the welcome screen.")}</p>
					</section>

					<section class="cmat-welcome-card">
						<button class="cmat-welcome-report" data-action="report">${__("Open Shop Report")}</button>
					</section>
				</aside>
			</div>
		`);

		this.bind();
	}

	metric(label, value) {
		return `
			<div class="cmat-welcome-metric">
				<span>${label}</span>
				<strong>${value}</strong>
			</div>
		`;
	}

	bind() {
		this.body.find('[data-field="profile"]').on("change", (event) => {
			this.refresh(event.currentTarget.value);
		});

		this.body.find('[data-action="start"]').on("click", () => this.start_sales_day());
		this.body.find('[data-action="report"]').on("click", () => this.open_report());
	}

	async start_sales_day() {
		const pos_profile = this.body.find('[data-field="profile"]').val();
		if (!pos_profile) {
			frappe.msgprint(__("Please create or assign a POS Profile first."));
			return;
		}

		const response = await frappe.call({
			method: "cmat_app.pos.start_sales_day",
			args: { pos_profile },
			freeze: true,
			freeze_message: __("Starting sales day"),
		});

		if (response.message && response.message.route) {
			frappe.set_route(response.message.route);
		}
	}

	open_report() {
		const pos_profile = this.body.find('[data-field="profile"]').val();
		frappe.route_options = {
			from_date: frappe.datetime.get_today(),
			to_date: frappe.datetime.get_today(),
			pos_profile,
			group_by: "Payment Method",
		};
		frappe.set_route("query-report", "POS Register");
	}
};
