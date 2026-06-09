frappe.provide("cmat_app");

frappe.pages["cmat-pos"].on_page_load = function (wrapper) {
	cmat_app.ensure_pos_styles();
	cmat_app.enter_pos_fullscreen();

	frappe.ui.make_app_page({
		parent: wrapper,
		title: __("CMAT POS"),
		single_column: true,
	});

	wrapper.cmat_pos = new cmat_app.SimplePOS(wrapper);
	cmat_app.active_pos = wrapper.cmat_pos;
};

cmat_app.enter_pos_fullscreen = function () {
	document.body.classList.add("cmat-pos-fullscreen");
	if (frappe.router && frappe.router.on && !cmat_app.pos_fullscreen_route_bound) {
		cmat_app.pos_fullscreen_route_bound = true;
		frappe.router.on("change", () => {
			if (frappe.get_route_str && frappe.get_route_str() !== "cmat-pos") {
				document.body.classList.remove("cmat-pos-fullscreen");
			}
		});
	}
};

cmat_app.ensure_pos_styles = function () {
	if (document.getElementById("cmat-pos-inline-styles")) return;

	const style = document.createElement("style");
	style.id = "cmat-pos-inline-styles";
	style.textContent = `
		body.cmat-pos-fullscreen {
			overflow: auto !important;
		}

		body.cmat-pos-fullscreen .navbar,
		body.cmat-pos-fullscreen .web-footer,
		body.cmat-pos-fullscreen .desk-sidebar,
		body.cmat-pos-fullscreen .standard-sidebar,
		body.cmat-pos-fullscreen .layout-side-section,
		body.cmat-pos-fullscreen .search-bar,
		body.cmat-pos-fullscreen .navbar .container {
			display: none !important;
		}

		body.cmat-pos-fullscreen .main-section,
		body.cmat-pos-fullscreen .page-container,
		body.cmat-pos-fullscreen .container,
		body.cmat-pos-fullscreen .desk-page,
		body.cmat-pos-fullscreen .page-content {
			width: 100vw !important;
			max-width: none !important;
			margin: 0 !important;
			padding: 0 !important;
		}

		body.cmat-pos-fullscreen .page-body {
			padding: 0 !important;
			margin: 0 !important;
		}

		.page-cmat-pos .page-head,
		.page-cmat-pos .page-title,
		.page-cmat-pos .page-actions {
			display: none !important;
		}

		.page-cmat-pos .layout-main,
		.page-cmat-pos .layout-main-section-wrapper,
		.page-cmat-pos .layout-main-section {
			width: 100% !important;
			max-width: none !important;
			margin: 0 !important;
			padding: 0 !important;
		}

		.page-cmat-pos .layout-main-section {
			background: #eef3ee !important;
		}

		.cmat-pos {
			width: 100vw !important;
			min-height: 100vh !important;
			min-height: 100dvh !important;
			display: grid !important;
			grid-template-rows: auto 1fr !important;
			background: #eef3ee !important;
			color: #14211b !important;
			font-size: 14px !important;
		}

		.cmat-pos * {
			box-sizing: border-box !important;
			letter-spacing: 0 !important;
			min-width: 0 !important;
		}

		.cmat-pos button,
		.cmat-pos input,
		.cmat-pos select {
			font: inherit !important;
		}

		.cmat-pos-shell {
			display: grid !important;
			grid-template-rows: auto 1fr !important;
			min-height: 100vh !important;
			min-height: 100dvh !important;
		}

		.cmat-pos-topbar {
			display: grid !important;
			grid-template-columns: minmax(260px, 1fr) auto !important;
			gap: 16px !important;
			align-items: center !important;
			padding: 14px 18px !important;
			border-bottom: 1px solid rgba(20, 33, 27, 0.1) !important;
			background: rgba(255, 255, 255, 0.96) !important;
			box-shadow: 0 8px 24px rgba(20, 33, 27, 0.06) !important;
			position: sticky !important;
			top: 0 !important;
			z-index: 5 !important;
			min-width: 0 !important;
		}

		.cmat-pos-brand {
			display: flex !important;
			align-items: center !important;
			gap: 12px !important;
			min-width: 0 !important;
		}

		.cmat-pos-mark {
			width: 48px !important;
			height: 48px !important;
			display: grid !important;
			place-items: center !important;
			border-radius: 8px !important;
			background: #0f6b49 !important;
			color: #ffffff !important;
			font-weight: 950 !important;
			box-shadow: 0 10px 20px rgba(15, 107, 73, 0.24) !important;
			flex: 0 0 auto !important;
		}

		.cmat-pos-brand h1 {
			margin: 0 !important;
			color: #14211b !important;
			font-size: 24px !important;
			font-weight: 950 !important;
			line-height: 1 !important;
			overflow-wrap: anywhere !important;
		}

		.cmat-pos-brand p {
			margin: 4px 0 0 !important;
			color: #65736b !important;
			font-size: 12px !important;
			font-weight: 750 !important;
			overflow-wrap: anywhere !important;
		}

		.cmat-pos-top-actions {
			display: flex !important;
			align-items: end !important;
			gap: 10px !important;
			min-width: 0 !important;
		}

		.cmat-pos-field {
			display: grid !important;
			gap: 5px !important;
			margin: 0 !important;
		}

		.cmat-pos-label {
			color: #65736b !important;
			font-size: 11px !important;
			font-weight: 900 !important;
			text-transform: uppercase !important;
		}

		.cmat-pos-select,
		.cmat-pos-search-input {
			height: 44px !important;
			border: 1px solid rgba(20, 33, 27, 0.14) !important;
			border-radius: 8px !important;
			padding: 0 12px !important;
			background: #ffffff !important;
			color: #14211b !important;
			font-size: 15px !important;
			font-weight: 800 !important;
			outline: none !important;
		}

		.cmat-pos-select {
			min-width: 220px !important;
		}

		.cmat-pos-search-input:focus,
		.cmat-pos-select:focus {
			border-color: #0f6b49 !important;
			box-shadow: 0 0 0 3px rgba(15, 107, 73, 0.12) !important;
		}

		.cmat-pos-btn {
			height: 44px !important;
			border: 1px solid rgba(20, 33, 27, 0.12) !important;
			border-radius: 8px !important;
			padding: 0 14px !important;
			background: #ffffff !important;
			color: #14211b !important;
			font-weight: 900 !important;
			cursor: pointer !important;
			white-space: nowrap !important;
			min-width: max-content !important;
		}

		.cmat-pos-btn:hover {
			border-color: #0f6b49 !important;
		}

		.cmat-pos-btn.primary {
			border-color: #0f6b49 !important;
			background: #0f6b49 !important;
			color: #ffffff !important;
		}

		.cmat-pos-btn.end {
			border-color: #d59625 !important;
			background: #fff3cf !important;
			color: #6d4700 !important;
		}

		.cmat-pos-main {
			display: grid !important;
			grid-template-columns: minmax(0, 1fr) minmax(360px, 420px) !important;
			gap: 14px !important;
			padding: 14px !important;
			min-height: 0 !important;
			overflow: visible !important;
		}

		.cmat-pos-left,
		.cmat-pos-order {
			min-width: 0 !important;
			min-height: 0 !important;
			border: 1px solid rgba(20, 33, 27, 0.1) !important;
			border-radius: 8px !important;
			background: rgba(255, 255, 255, 0.96) !important;
			box-shadow: 0 18px 44px rgba(20, 33, 27, 0.08) !important;
			overflow: hidden !important;
		}

		.cmat-pos-left {
			display: grid !important;
			grid-template-rows: auto auto 1fr !important;
			overflow: visible !important;
		}

		.cmat-pos-summary {
			display: grid !important;
			grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
			gap: 10px !important;
			padding: 14px !important;
			background:
				linear-gradient(135deg, rgba(15, 107, 73, 0.08), rgba(242, 183, 55, 0.12)),
				#ffffff !important;
			border-bottom: 1px solid rgba(20, 33, 27, 0.08) !important;
		}

		.cmat-pos-stat {
			display: grid !important;
			gap: 6px !important;
			min-height: 74px !important;
			align-content: center !important;
			padding: 12px !important;
			border-radius: 8px !important;
			background: rgba(255, 255, 255, 0.8) !important;
			border: 1px solid rgba(20, 33, 27, 0.08) !important;
		}

		.cmat-pos-stat span,
		.cmat-pos-section-eyebrow,
		.cmat-pos-pay-title {
			color: #69776f !important;
			font-size: 11px !important;
			font-weight: 900 !important;
			text-transform: uppercase !important;
		}

		.cmat-pos-stat strong {
			color: #0f6b49 !important;
			font-size: clamp(22px, 2.7vw, 31px) !important;
			font-weight: 950 !important;
			line-height: 1 !important;
			white-space: normal !important;
			overflow-wrap: anywhere !important;
		}

		.cmat-pos-product-head {
			display: grid !important;
			grid-template-columns: minmax(220px, 1fr) auto !important;
			gap: 12px !important;
			align-items: end !important;
			padding: 14px !important;
			border-bottom: 1px solid rgba(20, 33, 27, 0.08) !important;
		}

		.cmat-pos-title-block h2,
		.cmat-pos-order-title h2 {
			margin: 0 !important;
			color: #14211b !important;
			font-size: 24px !important;
			font-weight: 950 !important;
			line-height: 1 !important;
		}

		.cmat-pos-title-block p {
			margin: 5px 0 0 !important;
			color: #69776f !important;
			font-size: 13px !important;
			font-weight: 700 !important;
		}

		.cmat-pos-searchbar {
			display: grid !important;
			grid-template-columns: minmax(240px, 1fr) auto !important;
			gap: 8px !important;
			align-items: center !important;
			position: relative !important;
			overflow: visible !important;
			z-index: 4 !important;
		}

		.cmat-pos-search-wrap {
			position: relative !important;
			overflow: visible !important;
		}

		.cmat-pos-item-picker {
			display: none !important;
			position: absolute !important;
			top: calc(100% + 8px) !important;
			left: 0 !important;
			right: 0 !important;
			max-height: 340px !important;
			overflow: auto !important;
			padding: 8px !important;
			border: 1px solid rgba(20, 33, 27, 0.14) !important;
			border-radius: 8px !important;
			background: #ffffff !important;
			box-shadow: 0 22px 42px rgba(20, 33, 27, 0.18) !important;
			z-index: 20 !important;
		}

		.cmat-pos-search-wrap.open .cmat-pos-item-picker {
			display: grid !important;
			gap: 6px !important;
		}

		.cmat-pos-picker-item {
			width: 100% !important;
			display: grid !important;
			grid-template-columns: minmax(0, 1fr) auto !important;
			gap: 10px !important;
			align-items: center !important;
			min-height: 54px !important;
			border: 1px solid rgba(20, 33, 27, 0.08) !important;
			border-radius: 8px !important;
			padding: 9px 10px !important;
			background: #f8faf7 !important;
			color: #14211b !important;
			text-align: left !important;
			cursor: pointer !important;
		}

		.cmat-pos-picker-item:hover {
			border-color: #0f6b49 !important;
			background: #edf7f1 !important;
		}

		.cmat-pos-picker-item:disabled {
			opacity: 0.58 !important;
			cursor: not-allowed !important;
		}

		.cmat-pos-picker-item strong,
		.cmat-pos-picker-item span {
			display: block !important;
			overflow-wrap: anywhere !important;
		}

		.cmat-pos-picker-item strong {
			font-size: 14px !important;
			font-weight: 950 !important;
			line-height: 1.1 !important;
		}

		.cmat-pos-picker-item span {
			margin-top: 3px !important;
			color: #69776f !important;
			font-size: 12px !important;
			font-weight: 800 !important;
		}

		.cmat-pos-picker-price {
			color: #0f6b49 !important;
			font-size: 14px !important;
			font-weight: 950 !important;
			white-space: nowrap !important;
		}

		.cmat-pos-picker-empty {
			padding: 12px !important;
			color: #69776f !important;
			font-weight: 850 !important;
			text-align: center !important;
		}

		.cmat-pos-filters {
			display: flex !important;
			flex-wrap: wrap !important;
			gap: 8px !important;
			padding: 0 14px 14px !important;
		}

		.cmat-pos-chip {
			height: 34px !important;
			border: 1px solid rgba(20, 33, 27, 0.1) !important;
			border-radius: 999px !important;
			padding: 0 12px !important;
			background: #f6f8f5 !important;
			color: #34423a !important;
			font-size: 13px !important;
			font-weight: 850 !important;
			cursor: pointer !important;
		}

		.cmat-pos-chip.active {
			border-color: #0f6b49 !important;
			background: #e5f4ec !important;
			color: #0f6b49 !important;
		}

		.cmat-pos-product-scroll {
			min-height: 0 !important;
			overflow: auto !important;
			padding: 0 14px 14px !important;
		}

		.cmat-pos-products {
			display: grid !important;
			grid-template-columns: repeat(auto-fill, minmax(205px, 1fr)) !important;
			gap: 12px !important;
		}

		.cmat-pos-product {
			position: relative !important;
			min-height: 172px !important;
			display: grid !important;
			grid-template-rows: auto 1fr auto !important;
			gap: 12px !important;
			border: 1px solid rgba(20, 33, 27, 0.1) !important;
			border-radius: 8px !important;
			padding: 14px !important;
			background: linear-gradient(180deg, #ffffff, #f7fbf8) !important;
			color: #14211b !important;
			text-align: left !important;
			cursor: pointer !important;
			box-shadow: 0 10px 24px rgba(20, 33, 27, 0.07) !important;
			transition: transform 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease !important;
		}

		.cmat-pos-product:hover {
			transform: translateY(-2px) !important;
			border-color: #0f6b49 !important;
			box-shadow: 0 18px 34px rgba(15, 107, 73, 0.15) !important;
		}

		.cmat-pos-product.out {
			opacity: 0.58 !important;
			cursor: not-allowed !important;
			background: #f3f4ef !important;
		}

		.cmat-pos-product.out:hover {
			transform: none !important;
			border-color: rgba(20, 33, 27, 0.1) !important;
			box-shadow: 0 10px 24px rgba(20, 33, 27, 0.07) !important;
		}

		.cmat-pos-product-top {
			display: flex !important;
			align-items: start !important;
			justify-content: space-between !important;
			gap: 10px !important;
		}

		.cmat-pos-product-media {
			width: 58px !important;
			height: 58px !important;
			display: grid !important;
			place-items: center !important;
			border-radius: 8px !important;
			background: #e6f4ec !important;
			color: #0f6b49 !important;
			font-size: 18px !important;
			font-weight: 950 !important;
			overflow: hidden !important;
			flex: 0 0 auto !important;
		}

		.cmat-pos-product-media img {
			width: 100% !important;
			height: 100% !important;
			object-fit: cover !important;
		}

		.cmat-pos-stock-pill {
			min-height: 27px !important;
			display: inline-flex !important;
			align-items: center !important;
			border-radius: 999px !important;
			padding: 0 9px !important;
			background: #e6f4ec !important;
			color: #0f6b49 !important;
			font-size: 12px !important;
			font-weight: 900 !important;
			white-space: nowrap !important;
		}

		.cmat-pos-stock-pill.low {
			background: #fff3cf !important;
			color: #805600 !important;
		}

		.cmat-pos-stock-pill.out {
			background: #f7e3df !important;
			color: #a73426 !important;
		}

		.cmat-pos-product-name {
			display: block !important;
			color: #14211b !important;
			font-size: 20px !important;
			font-weight: 950 !important;
			line-height: 1.1 !important;
			overflow-wrap: anywhere !important;
		}

		.cmat-pos-product-foot {
			display: grid !important;
			grid-template-columns: minmax(0, 1fr) auto !important;
			gap: 10px !important;
			align-items: center !important;
		}

		.cmat-pos-price {
			color: #0f6b49 !important;
			font-size: 18px !important;
			font-weight: 950 !important;
			line-height: 1.1 !important;
			overflow-wrap: anywhere !important;
		}

		.cmat-pos-price small {
			display: block !important;
			margin-top: 2px !important;
			color: #69776f !important;
			font-size: 12px !important;
			font-weight: 800 !important;
		}

		.cmat-pos-plus {
			width: 42px !important;
			height: 42px !important;
			display: grid !important;
			place-items: center !important;
			border-radius: 8px !important;
			background: #0f6b49 !important;
			color: #ffffff !important;
			font-size: 26px !important;
			font-weight: 900 !important;
			line-height: 1 !important;
		}

		.cmat-pos-order {
			display: grid !important;
			grid-template-rows: auto 1fr auto !important;
			height: auto !important;
			max-height: calc(100vh - 96px) !important;
			max-height: calc(100dvh - 96px) !important;
			min-height: 0 !important;
		}

		.cmat-pos-order-head {
			padding: 16px !important;
			border-bottom: 1px solid rgba(20, 33, 27, 0.08) !important;
			background: linear-gradient(135deg, #14211b, #0f6b49) !important;
			color: #ffffff !important;
		}

		.cmat-pos-order-title {
			display: flex !important;
			align-items: center !important;
			justify-content: space-between !important;
			gap: 12px !important;
			min-width: 0 !important;
		}

		.cmat-pos-order-title h2 {
			color: #ffffff !important;
			overflow-wrap: anywhere !important;
		}

		.cmat-pos-count {
			min-width: 42px !important;
			height: 34px !important;
			display: grid !important;
			place-items: center !important;
			border-radius: 8px !important;
			background: rgba(255, 255, 255, 0.16) !important;
			color: #ffffff !important;
			font-weight: 950 !important;
		}

		.cmat-pos-order-head p {
			margin: 8px 0 0 !important;
			color: rgba(255, 255, 255, 0.78) !important;
			font-size: 13px !important;
			font-weight: 750 !important;
			overflow-wrap: anywhere !important;
		}

		.cmat-pos-lines {
			min-height: 0 !important;
			overflow: auto !important;
			display: grid !important;
			align-content: start !important;
			gap: 8px !important;
			padding: 12px !important;
			background: #f8faf7 !important;
		}

		.cmat-pos-empty {
			min-height: 180px !important;
			display: grid !important;
			place-items: center !important;
			border: 1px dashed rgba(20, 33, 27, 0.18) !important;
			border-radius: 8px !important;
			background: #ffffff !important;
			color: #69776f !important;
			font-size: 17px !important;
			font-weight: 850 !important;
			text-align: center !important;
			padding: 18px !important;
		}

		.cmat-pos-line {
			display: grid !important;
			grid-template-columns: minmax(0, 1fr) auto !important;
			gap: 10px !important;
			align-items: center !important;
			padding: 12px !important;
			border: 1px solid rgba(20, 33, 27, 0.08) !important;
			border-radius: 8px !important;
			background: #ffffff !important;
		}

		.cmat-pos-line strong,
		.cmat-pos-line span {
			display: block !important;
		}

		.cmat-pos-line strong {
			color: #14211b !important;
			font-size: 15px !important;
			font-weight: 950 !important;
			overflow-wrap: anywhere !important;
		}

		.cmat-pos-line span {
			margin-top: 3px !important;
			color: #69776f !important;
			font-size: 13px !important;
			font-weight: 750 !important;
		}

		.cmat-pos-qty {
			display: grid !important;
			grid-template-columns: 38px 38px 38px !important;
			gap: 5px !important;
			align-items: center !important;
			text-align: center !important;
		}

		.cmat-pos-qty button {
			height: 36px !important;
			border: 1px solid rgba(20, 33, 27, 0.12) !important;
			border-radius: 8px !important;
			background: #eef3ee !important;
			color: #14211b !important;
			font-size: 18px !important;
			font-weight: 950 !important;
			cursor: pointer !important;
		}

		.cmat-pos-qty b {
			color: #14211b !important;
			font-size: 16px !important;
			font-weight: 950 !important;
		}

		.cmat-pos-payment {
			display: grid !important;
			gap: 12px !important;
			padding: 14px !important;
			border-top: 1px solid rgba(20, 33, 27, 0.08) !important;
			background: #ffffff !important;
		}

		.cmat-pos-total {
			display: grid !important;
			grid-template-columns: 1fr auto !important;
			gap: 12px !important;
			align-items: end !important;
		}

		.cmat-pos-total span {
			color: #69776f !important;
			font-size: 12px !important;
			font-weight: 900 !important;
			text-transform: uppercase !important;
		}

		.cmat-pos-total strong {
			color: #0f6b49 !important;
			font-size: 34px !important;
			font-weight: 950 !important;
			line-height: 1 !important;
			text-align: right !important;
		}

		.cmat-pos-payments {
			display: grid !important;
			grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
			gap: 8px !important;
		}

		.cmat-pos-type-buttons {
			display: grid !important;
			grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
			gap: 8px !important;
		}

		.cmat-pos-type {
			min-height: 52px !important;
			border: 2px solid rgba(20, 33, 27, 0.1) !important;
			border-radius: 8px !important;
			background: #f8faf7 !important;
			color: #14211b !important;
			font-size: 14px !important;
			font-weight: 950 !important;
			cursor: pointer !important;
			overflow-wrap: anywhere !important;
		}

		.cmat-pos-type.active {
			border-color: #0f6b49 !important;
			background: #e6f4ec !important;
			color: #0f6b49 !important;
		}

		.cmat-pos-type.warning.active {
			border-color: #d59625 !important;
			background: #fff3cf !important;
			color: #6d4700 !important;
		}

		.cmat-pos-type.danger.active {
			border-color: #a73426 !important;
			background: #f7e3df !important;
			color: #a73426 !important;
		}

		.cmat-pos-pay {
			min-height: 56px !important;
			border: 2px solid rgba(20, 33, 27, 0.1) !important;
			border-radius: 8px !important;
			background: #ffffff !important;
			color: #14211b !important;
			font-size: 15px !important;
			font-weight: 950 !important;
			cursor: pointer !important;
			overflow-wrap: anywhere !important;
		}

		.cmat-pos-pay.active {
			border-color: #0f6b49 !important;
			background: #e6f4ec !important;
			color: #0f6b49 !important;
		}

		.cmat-pos-checkout {
			min-height: 66px !important;
			border: 0 !important;
			border-radius: 8px !important;
			background: #0f6b49 !important;
			color: #ffffff !important;
			font-size: 22px !important;
			font-weight: 950 !important;
			cursor: pointer !important;
			box-shadow: 0 12px 22px rgba(15, 107, 73, 0.24) !important;
		}

		.cmat-pos-checkout:disabled {
			background: #9aa49f !important;
			box-shadow: none !important;
			cursor: not-allowed !important;
		}

		.cmat-pos-receipt {
			display: grid !important;
			gap: 8px !important;
			padding: 12px !important;
			border: 1px solid rgba(15, 107, 73, 0.18) !important;
			border-radius: 8px !important;
			background: #e6f4ec !important;
		}

		.cmat-pos-receipt strong,
		.cmat-pos-receipt span {
			display: block !important;
			color: #0f6b49 !important;
			font-weight: 900 !important;
		}

		.cmat-pos-open {
			min-height: 400px !important;
			display: grid !important;
			place-items: center !important;
			gap: 16px !important;
			padding: 28px !important;
			text-align: center !important;
		}

		.cmat-pos-open-panel {
			max-width: 520px !important;
			display: grid !important;
			gap: 14px !important;
			padding: 28px !important;
			border: 1px solid rgba(20, 33, 27, 0.1) !important;
			border-radius: 8px !important;
			background: #ffffff !important;
			box-shadow: 0 18px 44px rgba(20, 33, 27, 0.08) !important;
		}

		.cmat-pos-open h2 {
			margin: 0 !important;
			color: #14211b !important;
			font-size: 38px !important;
			font-weight: 950 !important;
		}

		.cmat-pos-open p {
			margin: 0 !important;
			color: #69776f !important;
			font-size: 16px !important;
			font-weight: 750 !important;
		}

		@media (max-width: 1180px) {
			.cmat-pos-main,
			.cmat-pos-topbar {
				grid-template-columns: 1fr !important;
			}

			.cmat-pos-order {
				max-height: none !important;
				min-height: auto !important;
			}

			.cmat-pos-left,
			.cmat-pos-order {
				overflow: visible !important;
			}

			.cmat-pos-product-scroll,
			.cmat-pos-lines {
				overflow: visible !important;
			}

			.cmat-pos-top-actions {
				justify-content: stretch !important;
				flex-wrap: wrap !important;
			}
		}

		@media (max-width: 760px) {
			.cmat-pos-main {
				padding: 8px !important;
				gap: 8px !important;
			}

			.cmat-pos-topbar {
				padding: 10px !important;
				gap: 10px !important;
			}

			.cmat-pos-brand {
				align-items: start !important;
			}

			.cmat-pos-mark {
				width: 40px !important;
				height: 40px !important;
			}

			.cmat-pos-brand h1 {
				font-size: 20px !important;
			}

			.cmat-pos-brand p {
				font-size: 11px !important;
			}

			.cmat-pos-top-actions {
				display: grid !important;
				grid-template-columns: 1fr !important;
				align-items: stretch !important;
			}

			.cmat-pos-btn,
			.cmat-pos-select,
			.cmat-pos-search-input {
				width: 100% !important;
			}

			.cmat-pos-summary,
			.cmat-pos-product-head,
			.cmat-pos-searchbar,
			.cmat-pos-payments,
			.cmat-pos-type-buttons {
				grid-template-columns: 1fr !important;
			}

			.cmat-pos-products {
				grid-template-columns: 1fr !important;
			}

			.cmat-pos-product {
				min-height: 146px !important;
			}

			.cmat-pos-total {
				grid-template-columns: 1fr !important;
			}

			.cmat-pos-total strong {
				text-align: left !important;
				font-size: 30px !important;
			}

			.cmat-pos-line {
				grid-template-columns: 1fr !important;
			}

			.cmat-pos-select {
				min-width: 0 !important;
			}
		}

		@media (max-width: 430px) {
			.cmat-pos-summary {
				gap: 6px !important;
			}

			.cmat-pos-stat {
				min-height: 64px !important;
				padding: 10px !important;
			}

			.cmat-pos-stat strong {
				font-size: 22px !important;
				white-space: normal !important;
				overflow-wrap: anywhere !important;
			}

			.cmat-pos-product-head,
			.cmat-pos-payment,
			.cmat-pos-order-head,
			.cmat-pos-summary {
				padding: 10px !important;
			}

			.cmat-pos-qty {
				grid-template-columns: 42px 1fr 42px !important;
			}
		}
	`;
	document.head.appendChild(style);
};

cmat_app.SimplePOS = class {
	constructor(wrapper) {
		$(wrapper).addClass("page-cmat-pos");
		this.wrapper = $(wrapper).find(".layout-main-section");
		this.context = {};
		this.cart = {};
		this.payment_mode = "";
		this.transaction_type = "Sale";
		this.stock_filter = "all";
		this.search_term = "";
		this.last_invoice = null;
		this.make();
	}

	async make() {
		this.wrapper.html(`<div class="cmat-pos"></div>`);
		this.body = this.wrapper.find(".cmat-pos");
		await this.refresh();
	}

	async refresh(pos_profile, search_term) {
		const response = await frappe.call({
			method: "cmat_app.pos.get_simple_pos_context",
			args: { pos_profile, search_term },
			freeze: true,
			freeze_message: __("Loading POS"),
		});
		this.context = response.message || {};
		this.render();
	}

	render() {
		const dashboard = this.context.dashboard || {};
		const selected = this.context.selected_profile || "";
		const profiles = this.context.profiles || [];
		const items = this.context.items || [];
		const modes = this.context.payment_modes || [];
		const opening = this.context.opening_entry;

		this.body.html(`
			<div class="cmat-pos-shell">
				<header class="cmat-pos-topbar">
					<div class="cmat-pos-brand">
						<div class="cmat-pos-mark">CM</div>
						<div>
							<h1>${__("Dairy Shop POS")}</h1>
							<p>CMAT GROUP LTD - ${frappe.datetime.str_to_user(frappe.datetime.get_today())}</p>
						</div>
					</div>
					<div class="cmat-pos-top-actions">
						<label class="cmat-pos-field">
							<span class="cmat-pos-label">${__("Shop")}</span>
							<select class="cmat-pos-select" data-field="profile">
								${profiles.map((profile) => `<option value="${frappe.utils.escape_html(profile.name)}" ${profile.name === selected ? "selected" : ""}>${frappe.utils.escape_html(profile.name)}</option>`).join("")}
							</select>
						</label>
						<button class="cmat-pos-btn" data-action="sales-day">${__("Sales Day")}</button>
						<button class="cmat-pos-btn end" data-action="end-day">${__("End Sales Day")}</button>
					</div>
				</header>

				${opening ? this.pos_layout(items, modes, dashboard) : this.opening_prompt(selected)}
			</div>
		`);

		this.bind();
	}

	pos_layout(items, modes, dashboard) {
		const filtered_items = this.filtered_items(items);
		return `
			<main class="cmat-pos-main">
				<section class="cmat-pos-left">
					<div class="cmat-pos-summary">
						${this.metric(__("Today Sales"), format_currency(dashboard.today_sales || 0))}
						${this.metric(__("Litres Sold"), `${flt(dashboard.litres_sold || 0, 2)} L`)}
						${this.metric(__("Sales Count"), flt(dashboard.bought_today || 0, 0))}
						${this.metric(__("Staff Use"), `${flt(dashboard.staff_use_qty || 0, 2)} L`)}
						${this.metric(__("Sample"), `${flt(dashboard.sample_qty || 0, 2)} L`)}
						${this.metric(__("Loss"), `${flt(dashboard.loss_qty || 0, 2)} L`)}
					</div>

					<div class="cmat-pos-product-head">
						<div class="cmat-pos-title-block">
							<span class="cmat-pos-section-eyebrow">${__("Products")}</span>
							<h2>${__("Tap Item To Sell")}</h2>
							<p>${__("Stock is checked before item enters the cart.")}</p>
						</div>
						<div class="cmat-pos-searchbar">
							<div class="cmat-pos-search-wrap">
								<input class="cmat-pos-search-input" data-field="search" type="search" value="${frappe.utils.escape_html(this.search_term || "")}" placeholder="${__("Search product")}" autocomplete="off" />
								<div class="cmat-pos-item-picker">
									${this.item_picker_options(this.search_term)}
								</div>
							</div>
							<button class="cmat-pos-btn" data-action="search">${__("Search")}</button>
						</div>
					</div>

					<div class="cmat-pos-filters">
						${this.filter_button("all", __("All"))}
						${this.filter_button("available", __("In Stock"))}
						${this.filter_button("low", __("Low Stock"))}
						${this.filter_button("out", __("Out"))}
					</div>

					<div class="cmat-pos-product-scroll">
						<div class="cmat-pos-products">
							${filtered_items.length ? filtered_items.map((item) => this.item_tile(item)).join("") : `<div class="cmat-pos-empty">${__("No products found")}</div>`}
						</div>
					</div>
				</section>

				<aside class="cmat-pos-order">
					<div class="cmat-pos-order-head">
						<div class="cmat-pos-order-title">
							<h2>${__("Current Sale")}</h2>
							<div class="cmat-pos-count">${this.cart_count()}</div>
						</div>
						<p>${__("Choose product, choose payment, check out.")}</p>
					</div>

					<div class="cmat-pos-lines">
						${this.cart_lines()}
					</div>

					<div class="cmat-pos-payment">
						<div class="cmat-pos-pay-title">${__("Action")}</div>
						<div class="cmat-pos-type-buttons">
							${this.transaction_type_button("Sale", __("Sale"))}
							${this.transaction_type_button("Staff Use", __("Staff Use"))}
							${this.transaction_type_button("Sample", __("Sample"))}
							${this.transaction_type_button("Loss", __("Loss"))}
						</div>
						<div class="cmat-pos-total">
							<span>${this.transaction_type === "Sale" ? __("Total") : __("Stock Use")}</span>
							<strong>${this.transaction_type === "Sale" ? format_currency(this.cart_total()) : `${flt(this.cart_count(), 2)} ${__("Items")}`}</strong>
						</div>
						${this.transaction_type === "Sale" ? `
							<div class="cmat-pos-pay-title">${__("Payment")}</div>
							<div class="cmat-pos-payments">
								${modes.length ? modes.map((mode) => this.payment_button(mode)).join("") : `<div class="cmat-pos-empty">${__("No payment modes")}</div>`}
							</div>
						` : ""}
						<button class="cmat-pos-checkout" data-action="checkout" ${this.can_checkout() ? "" : "disabled"}>
							${this.checkout_label()}
						</button>
						${this.last_invoice ? this.receipt_panel() : ""}
					</div>
				</aside>
			</main>
		`;
	}

	opening_prompt(pos_profile) {
		return `
			<main class="cmat-pos-open">
				<div class="cmat-pos-open-panel">
					<h2>${__("Start Sales Day")}</h2>
					<p>${__("Open the shop day before selling.")}</p>
					<button class="cmat-pos-btn primary" data-action="start" ${pos_profile ? "" : "disabled"}>${__("Start Sales Day")}</button>
				</div>
			</main>
		`;
	}

	metric(label, value) {
		return `
			<div class="cmat-pos-stat">
				<span>${label}</span>
				<strong>${value}</strong>
			</div>
		`;
	}

	filter_button(filter, label) {
		return `<button class="cmat-pos-chip ${this.stock_filter === filter ? "active" : ""}" data-filter="${filter}">${label}</button>`;
	}

	filtered_items(items) {
		if (this.stock_filter === "available") {
			return items.filter((item) => item.stock_status !== "out");
		}
		if (this.stock_filter === "low") {
			return items.filter((item) => cint(item.is_stock_item || 0) && flt(item.available_qty || 0) > 0 && flt(item.available_qty || 0) <= 5);
		}
		if (this.stock_filter === "out") {
			return items.filter((item) => item.stock_status === "out");
		}
		return items;
	}

	item_tile(item) {
		const code = frappe.utils.escape_html(item.item_code);
		const name = frappe.utils.escape_html(item.item_name || item.item_code);
		const uom = frappe.utils.escape_html(item.uom || item.stock_uom || "");
		const rate = flt(item.price_list_rate || 0);
		const image = item.item_image ? frappe.utils.escape_html(item.item_image) : "";
		const initials = this.initials(item.item_name || item.item_code);
		const available = item.available_qty;
		const is_stock_item = cint(item.is_stock_item || 0);
		const available_qty = flt(available || 0);
		const is_out = is_stock_item && available_qty <= 0;
		const is_low = is_stock_item && available_qty > 0 && available_qty <= 5;
		const stock_text = is_stock_item
			? (is_out ? __("Out of stock") : `${flt(available_qty, 2)} ${uom}`)
			: __("Open");

		return `
			<button class="cmat-pos-product ${is_out ? "out" : ""}" data-item="${code}" data-name="${name}" data-rate="${rate}" data-uom="${uom}" data-available="${available === null || available === undefined ? "" : flt(available, 3)}" data-stock-item="${is_stock_item}">
				<div class="cmat-pos-product-top">
					<div class="cmat-pos-product-media">
						${image ? `<img src="${image}" alt="">` : `<span>${initials}</span>`}
					</div>
					<span class="cmat-pos-stock-pill ${is_out ? "out" : is_low ? "low" : ""}">${stock_text}</span>
				</div>
				<strong class="cmat-pos-product-name">${name}</strong>
				<span class="cmat-pos-product-foot">
					<span class="cmat-pos-price">${format_currency(rate)}<small>${uom || __("Unit")}</small></span>
					<span class="cmat-pos-plus">+</span>
				</span>
			</button>
		`;
	}

	cart_lines() {
		const rows = Object.values(this.cart);
		if (!rows.length) {
			return `<div class="cmat-pos-empty">${__("Tap a product to begin")}</div>`;
		}

		return rows.map((row) => `
			<div class="cmat-pos-line">
				<div>
					<strong>${frappe.utils.escape_html(row.item_name)}</strong>
					<span>${row.qty} x ${format_currency(row.rate)}</span>
				</div>
				<div class="cmat-pos-qty">
					<button data-action="minus" data-item="${frappe.utils.escape_html(row.item_code)}">-</button>
					<b>${row.qty}</b>
					<button data-action="plus" data-item="${frappe.utils.escape_html(row.item_code)}">+</button>
				</div>
			</div>
		`).join("");
	}

	payment_button(mode) {
		const name = frappe.utils.escape_html(mode.mode_of_payment);
		const active = this.payment_mode === mode.mode_of_payment ? "active" : "";
		return `<button class="cmat-pos-pay ${active}" data-payment="${name}">${name}</button>`;
	}

	transaction_type_button(type, label) {
		const active = this.transaction_type === type ? "active" : "";
		const tone = type === "Loss" ? "danger" : type === "Sample" || type === "Staff Use" ? "warning" : "";
		return `<button class="cmat-pos-type ${tone} ${active}" data-transaction-type="${frappe.utils.escape_html(type)}">${label}</button>`;
	}

	receipt_panel() {
		const label = this.last_invoice.invoice
			? __("Sales Invoice Created")
			: this.last_invoice.transaction_type && this.last_invoice.transaction_type !== "Sale"
				? __("{0} Recorded", [this.last_invoice.transaction_type])
				: __("Sale Saved");
		const name = this.last_invoice.invoice || this.last_invoice.sale;
		return `
			<div class="cmat-pos-receipt">
				<strong>${label}: ${frappe.utils.escape_html(name)}</strong>
				<span>${format_currency(this.last_invoice.rounded_total || this.last_invoice.grand_total)}</span>
				<button class="cmat-pos-btn" data-action="print">${__("Print Receipt")}</button>
			</div>
		`;
	}

	item_picker_options(search_term = "") {
		const term = (search_term || "").toLowerCase().trim();
		const items = (this.context.items || [])
			.filter((item) => {
				if (!term) return true;
				return `${item.item_code || ""} ${item.item_name || ""}`.toLowerCase().includes(term);
			})
			.slice(0, 30);

		if (!items.length) {
			return `<div class="cmat-pos-picker-empty">${__("No matching item")}</div>`;
		}

		return items.map((item) => {
			const code = frappe.utils.escape_html(item.item_code);
			const name = frappe.utils.escape_html(item.item_name || item.item_code);
			const uom = frappe.utils.escape_html(item.uom || item.stock_uom || "");
			const rate = flt(item.price_list_rate || 0);
			const available = item.available_qty;
			const is_stock_item = cint(item.is_stock_item || 0);
			const available_qty = flt(available || 0);
			const is_out = is_stock_item && available_qty <= 0;
			const stock_text = is_stock_item
				? (is_out ? __("Out of stock") : `${flt(available_qty, 2)} ${uom}`)
				: __("Open item");

			return `
				<button class="cmat-pos-picker-item" data-picker-item data-item="${code}" data-name="${name}" data-rate="${rate}" data-uom="${uom}" data-available="${available === null || available === undefined ? "" : flt(available, 3)}" data-stock-item="${is_stock_item}" ${is_out ? "disabled" : ""}>
					<span>
						<strong>${name}</strong>
						<span>${code} - ${stock_text}</span>
					</span>
					<b class="cmat-pos-picker-price">${format_currency(rate)}</b>
				</button>
			`;
		}).join("");
	}

	bind() {
		this.body.find('[data-field="profile"]').on("change", (event) => {
			this.cart = {};
			this.payment_mode = "";
			this.last_invoice = null;
			this.refresh(event.currentTarget.value);
		});

		this.body.find("[data-filter]").on("click", (event) => {
			this.stock_filter = event.currentTarget.dataset.filter;
			this.render();
		});
		this.body.find("[data-transaction-type]").on("click", (event) => {
			this.transaction_type = event.currentTarget.dataset.transactionType;
			this.payment_mode = "";
			this.last_invoice = null;
			this.render();
		});
		this.body.find('[data-action="sales-day"]').on("click", () => frappe.set_route("cmat-sales-day"));
		this.body.find('[data-action="end-day"]').on("click", () => this.end_sales_day());
		this.body.find('[data-action="start"]').on("click", () => this.start_sales_day());
		this.body.find('[data-action="search"]').on("click", () => this.search());
		this.body.find('[data-field="search"]').on("focus click", () => this.show_item_picker());
		this.body.find('[data-field="search"]').on("input", (event) => {
			this.search_term = event.currentTarget.value;
			this.update_item_picker();
		});
		this.body.find('[data-field="search"]').on("keydown", (event) => {
			if (event.key === "Enter") this.search();
			if (event.key === "Escape") this.hide_item_picker();
		});
		this.body.find("[data-picker-item]").on("click", (event) => {
			this.hide_item_picker();
			this.add_item(event.currentTarget);
		});
		this.body.find(".cmat-pos-product").on("click", (event) => this.add_item(event.currentTarget));
		this.body.find('[data-action="plus"]').on("click", (event) => this.change_qty(event.currentTarget.dataset.item, 1));
		this.body.find('[data-action="minus"]').on("click", (event) => this.change_qty(event.currentTarget.dataset.item, -1));
		this.body.find("[data-payment]").on("click", (event) => {
			this.payment_mode = event.currentTarget.dataset.payment;
			this.last_invoice = null;
			this.render();
		});
		this.body.find('[data-action="checkout"]').on("click", () => this.checkout());
		this.body.find('[data-action="print"]').on("click", () => this.print_receipt());
		$(document)
			.off("mousedown.cmat_pos_item_picker")
			.on("mousedown.cmat_pos_item_picker", (event) => {
				if (!$(event.target).closest(".cmat-pos-searchbar").length) {
					this.hide_item_picker();
				}
			});
	}

	async start_sales_day() {
		const pos_profile = this.body.find('[data-field="profile"]').val();
		await frappe.call({
			method: "cmat_app.pos.start_sales_day",
			args: { pos_profile },
			freeze: true,
			freeze_message: __("Starting sales day"),
		});
		await this.refresh(pos_profile);
	}

	search() {
		const pos_profile = this.body.find('[data-field="profile"]').val();
		const search_term = this.body.find('[data-field="search"]').val();
		this.search_term = search_term;
		this.refresh(pos_profile, search_term);
	}

	show_item_picker() {
		this.update_item_picker();
		this.body.find(".cmat-pos-search-wrap").addClass("open");
	}

	hide_item_picker() {
		this.body.find(".cmat-pos-search-wrap").removeClass("open");
	}

	update_item_picker() {
		this.body.find(".cmat-pos-item-picker").html(this.item_picker_options(this.search_term));
		this.body.find("[data-picker-item]").off("click").on("click", (event) => {
			this.hide_item_picker();
			this.add_item(event.currentTarget);
		});
	}

	add_item(button) {
		const item_code = button.dataset.item;
		const available = button.dataset.available === "" ? null : flt(button.dataset.available || 0);
		const is_stock_item = cint(button.dataset.stockItem || 0);
		const current_qty = this.cart[item_code] ? flt(this.cart[item_code].qty) : 0;

		if (is_stock_item && available !== null && current_qty + 1 > available) {
			frappe.show_alert({
				message: __("Not enough stock for {0}. Available: {1}", [button.dataset.name, available]),
				indicator: "red",
			});
			return;
		}

		if (!this.cart[item_code]) {
			this.cart[item_code] = {
				item_code,
				item_name: button.dataset.name,
				uom: button.dataset.uom,
				rate: flt(button.dataset.rate || 0),
				available_qty: available,
				is_stock_item,
				qty: 0,
			};
		}
		this.cart[item_code].qty += 1;
		this.last_invoice = null;
		this.render();
	}

	change_qty(item_code, delta) {
		if (!this.cart[item_code]) return;
		if (
			delta > 0 &&
			this.cart[item_code].is_stock_item &&
			this.cart[item_code].available_qty !== null &&
			flt(this.cart[item_code].qty) + delta > flt(this.cart[item_code].available_qty)
		) {
			frappe.show_alert({
				message: __("Not enough stock for {0}. Available: {1}", [
					this.cart[item_code].item_name,
					this.cart[item_code].available_qty,
				]),
				indicator: "red",
			});
			return;
		}
		this.cart[item_code].qty += delta;
		if (this.cart[item_code].qty <= 0) {
			delete this.cart[item_code];
		}
		this.last_invoice = null;
		this.render();
	}

	cart_count() {
		return Object.values(this.cart).reduce((count, row) => count + flt(row.qty), 0);
	}

	cart_total() {
		return Object.values(this.cart).reduce((total, row) => total + flt(row.qty) * flt(row.rate), 0);
	}

	can_checkout() {
		if (!Object.keys(this.cart).length) return false;
		return this.transaction_type !== "Sale" || this.payment_mode;
	}

	checkout_label() {
		if (!Object.keys(this.cart).length) {
			return __("Add Item First");
		}
		if (this.transaction_type === "Sale" && !this.payment_mode) {
			return __("Choose Payment First");
		}
		if (this.transaction_type !== "Sale") {
			return __("Record {0}", [this.transaction_type]);
		}
		return __("Check Out");
	}

	initials(value) {
		return (value || "CM").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
	}

	async checkout() {
		if (!Object.keys(this.cart).length) return;
		if (this.transaction_type === "Sale" && !this.payment_mode) {
			frappe.show_alert({
				message: __("Choose payment mode before checkout."),
				indicator: "orange",
			});
			return;
		}
		const pos_profile = this.body.find('[data-field="profile"]').val();
		const response = await frappe.call({
			method: "cmat_app.pos.checkout",
			args: {
				pos_profile,
				mode_of_payment: this.payment_mode,
				transaction_type: this.transaction_type,
				items: Object.values(this.cart),
			},
			freeze: true,
			freeze_message: this.transaction_type === "Sale" ? __("Saving sale") : __("Recording stock use"),
		});

		this.last_invoice = response.message;
		this.cart = {};
		this.payment_mode = "";
		this.transaction_type = "Sale";
		this.context.dashboard = response.message.dashboard || this.context.dashboard;
		await this.refresh(pos_profile);
		this.last_invoice = response.message;
		this.render();
	}

	async end_sales_day() {
		const pos_profile = this.body.find('[data-field="profile"]').val();
		const expected_total = flt((this.context.dashboard || {}).today_sales || 0);
		const dialog = new frappe.ui.Dialog({
			title: __("End Sales Day"),
			fields: [
				{
					fieldname: "system_sales_total",
					fieldtype: "Currency",
					label: __("System Sales Total"),
					default: expected_total,
					read_only: 1,
				},
				{
					fieldname: "cash_deposited",
					fieldtype: "Currency",
					label: __("Cash Deposited"),
					default: 0,
				},
				{
					fieldname: "mobile_money_amount",
					fieldtype: "Currency",
					label: __("Mobile Money"),
					default: 0,
				},
				{
					fieldname: "total_declared_html",
					fieldtype: "HTML",
					options: `<div class="text-muted">${__("Total is calculated automatically and cannot be higher than system sales.")}</div>`,
				},
			],
			primary_action_label: __("End Sales Day"),
			primary_action: async (values) => {
				const cash_deposited = flt(values.cash_deposited || 0);
				const mobile_money_amount = flt(values.mobile_money_amount || 0);
				const total_declared = cash_deposited + mobile_money_amount;
				if (total_declared > expected_total) {
					frappe.msgprint({
						title: __("Amount Too High"),
						indicator: "red",
						message: __("Cash Deposited plus Mobile Money cannot be more than the system sales total."),
					});
					return;
				}
				dialog.hide();
				const response = await frappe.call({
					method: "cmat_app.pos.end_sales_day",
					args: { pos_profile, cash_deposited, mobile_money_amount },
					freeze: true,
					freeze_message: __("Creating daily Sales Invoice"),
				});
				this.last_invoice = response.message;
				this.context.dashboard = response.message.dashboard || this.context.dashboard;
				this.cart = {};
				this.render();
				if (response.message.summary) {
					this.show_sales_day_summary(response.message.summary);
				}
				frappe.show_alert({
					message: response.message.invoice ? __("Daily Sales Invoice created") : __("Sales day summary ready"),
					indicator: "green",
				});
			},
		});
		dialog.show();
	}

	show_sales_day_summary(summary) {
		this.current_day_summary = summary;
		const rows = summary.rows || [];
		const payments = summary.payment_totals || [];
		const money = (value) => format_currency(flt(value || 0));
		const qty = (value) => flt(value || 0, 2);
		const esc = (value) => frappe.utils.escape_html(value == null ? "" : String(value));
		const table_rows = rows.length
			? rows.map((row) => `
				<tr>
					<td><strong>${esc(row.item_name || row.item_code)}</strong><br><span>${esc(row.uom)}</span></td>
					<td>${qty(row.opening_stock)}</td>
					<td>${qty(row.additional_stock)}</td>
					<td>${qty(row.sold_qty)}</td>
					<td>${qty(row.staff_use_qty)}</td>
					<td>${qty(row.sample_qty)}</td>
					<td>${qty(row.loss_qty)}</td>
					<td>${qty(row.closing_stock)}</td>
					<td class="amount">${money(row.revenue)}</td>
				</tr>
			`).join("")
			: `<tr><td colspan="9" class="empty">${__("No stock movement found")}</td></tr>`;
		const payment_rows = payments.length
			? payments.map((row) => `
				<div class="cmat-summary-payment">
					<span>${esc(row.mode_of_payment)}</span>
					<strong>${money(row.amount)}</strong>
				</div>
			`).join("")
			: `<div class="cmat-summary-payment"><span>${__("Payments")}</span><strong>${money(0)}</strong></div>`;
		const declaration_rows = `
			<div class="cmat-summary-payment">
				<span>${__("Cash Deposited")}</span>
				<strong>${money(summary.cash_deposited)}</strong>
			</div>
			<div class="cmat-summary-payment">
				<span>${__("Mobile Money")}</span>
				<strong>${money(summary.mobile_money_amount)}</strong>
			</div>
			<div class="cmat-summary-payment">
				<span>${__("Total Declared")}</span>
				<strong>${money(summary.total_declared)}</strong>
			</div>
			<div class="cmat-summary-payment">
				<span>${__("Shortage")}</span>
				<strong>${money(summary.shortage)}</strong>
			</div>
		`;

		frappe.msgprint({
			title: __("Sales Day Summary"),
			wide: true,
			indicator: "green",
			message: `
				<style>
					.cmat-day-summary {
						display: grid;
						gap: 14px;
						color: #14211b;
					}
					.cmat-day-summary .head {
						display: grid;
						grid-template-columns: 1fr auto;
						gap: 12px;
						align-items: start;
					}
					.cmat-day-summary h3 {
						margin: 0;
						font-size: 20px;
						font-weight: 900;
					}
					.cmat-day-summary .muted {
						color: #69776f;
						font-size: 12px;
						font-weight: 700;
					}
					.cmat-day-summary .totals {
						display: grid;
						grid-template-columns: repeat(4, minmax(0, 1fr));
						gap: 8px;
					}
					.cmat-day-summary .stat,
					.cmat-summary-payment {
						border: 1px solid #e3e9e5;
						border-radius: 8px;
						padding: 10px;
						background: #f8faf7;
					}
					.cmat-day-summary .stat span,
					.cmat-summary-payment span {
						display: block;
						color: #69776f;
						font-size: 11px;
						font-weight: 900;
						text-transform: uppercase;
					}
					.cmat-day-summary .stat strong,
					.cmat-summary-payment strong {
						display: block;
						margin-top: 3px;
						color: #0f6b49;
						font-size: 17px;
						font-weight: 950;
					}
					.cmat-day-summary .table-wrap {
						max-height: 420px;
						overflow: auto;
						border: 1px solid #e3e9e5;
						border-radius: 8px;
					}
					.cmat-day-summary table {
						width: 100%;
						border-collapse: collapse;
						font-size: 12px;
					}
					.cmat-day-summary th {
						position: sticky;
						top: 0;
						background: #0f6b49;
						color: #fff;
						padding: 9px 7px;
						text-align: right;
						white-space: nowrap;
					}
					.cmat-day-summary th:first-child,
					.cmat-day-summary td:first-child {
						text-align: left;
					}
					.cmat-day-summary td {
						padding: 8px 7px;
						border-bottom: 1px solid #edf1ee;
						text-align: right;
						vertical-align: top;
					}
					.cmat-day-summary td span {
						color: #69776f;
						font-size: 11px;
					}
					.cmat-day-summary .amount {
						font-weight: 900;
						color: #0f6b49;
					}
					.cmat-day-summary .payments {
						display: grid;
						grid-template-columns: repeat(3, minmax(0, 1fr));
						gap: 8px;
					}
					.cmat-day-summary .declaration {
						grid-template-columns: repeat(4, minmax(0, 1fr));
					}
					.cmat-day-summary .section-label {
						margin: 0;
						font-size: 13px;
						font-weight: 950;
						color: #14211b;
					}
					.cmat-day-summary .actions {
						display: flex;
						flex-wrap: wrap;
						gap: 8px;
						justify-content: flex-end;
					}
					.cmat-day-summary .action-btn {
						min-height: 38px;
						border: 1px solid #0f6b49;
						border-radius: 8px;
						padding: 0 14px;
						background: #0f6b49;
						color: #fff;
						font-weight: 900;
						cursor: pointer;
						touch-action: manipulation;
						position: relative;
						z-index: 2;
					}
					.cmat-day-summary .action-btn.secondary {
						background: #fff;
						color: #0f6b49;
					}
					.cmat-day-summary .empty {
						text-align: center !important;
						color: #69776f;
						font-weight: 800;
					}
					@media (max-width: 760px) {
						.cmat-day-summary .head,
						.cmat-day-summary .totals,
						.cmat-day-summary .payments {
							grid-template-columns: 1fr;
						}
						.cmat-day-summary .actions {
							display: grid;
							grid-template-columns: 1fr;
						}
						.cmat-day-summary .action-btn {
							width: 100%;
						}
					}
				</style>
				<div class="cmat-day-summary">
					<div class="actions">
						<button type="button" class="action-btn" onclick="cmat_app.active_pos && cmat_app.active_pos.print_sales_day_summary()">${__("Print Report")}</button>
						<button type="button" class="action-btn secondary" onclick="cmat_app.active_pos && cmat_app.active_pos.download_sales_day_summary()">${__("Download Report")}</button>
					</div>
					<div class="head">
						<div>
							<h3>${esc(summary.pos_profile)}</h3>
							<div class="muted">${__("Opening")}: ${esc(summary.opening_entry)} ${summary.invoice ? ` | ${__("Invoice")}: ${esc(summary.invoice)}` : ""}</div>
							<div class="muted">${esc(summary.from_datetime)} - ${esc(summary.to_datetime)}</div>
						</div>
						<div class="stat">
							<span>${__("Total Sales")}</span>
							<strong>${money(summary.total_sales)}</strong>
						</div>
					</div>
					<div class="totals">
						<div class="stat"><span>${__("Qty Sold")}</span><strong>${qty(summary.total_qty_sold)}</strong></div>
						<div class="stat"><span>${__("Staff Use")}</span><strong>${qty(summary.total_staff_use)}</strong></div>
						<div class="stat"><span>${__("Sample")}</span><strong>${qty(summary.total_sample)}</strong></div>
						<div class="stat"><span>${__("Loss")}</span><strong>${qty(summary.total_loss)}</strong></div>
					</div>
					<div class="table-wrap">
						<table>
							<thead>
								<tr>
									<th>${__("Item")}</th>
									<th>${__("Opening")}</th>
									<th>${__("Additional")}</th>
									<th>${__("Sold")}</th>
									<th>${__("Staff")}</th>
									<th>${__("Sample")}</th>
									<th>${__("Loss")}</th>
									<th>${__("Closing")}</th>
									<th>${__("Revenue")}</th>
								</tr>
							</thead>
							<tbody>${table_rows}</tbody>
						</table>
					</div>
					<h4 class="section-label">${__("Cashier Money Declaration")}</h4>
					<div class="payments declaration">${declaration_rows}</div>
					<h4 class="section-label">${__("System Payment Totals")}</h4>
					<div class="payments">${payment_rows}</div>
				</div>
			`,
		});

	}

	print_sales_day_summary() {
		if (!this.current_day_summary) return;
		const print_window = window.open("", "_blank");
		if (!print_window) {
			frappe.show_alert({ message: __("Please allow popups to print the report."), indicator: "orange" });
			return;
		}
		print_window.document.open();
		print_window.document.write(this.sales_day_summary_print_html(this.current_day_summary));
		print_window.document.close();
		print_window.focus();
		setTimeout(() => print_window.print(), 350);
	}

	download_sales_day_summary() {
		if (!this.current_day_summary) return;
		const html = this.sales_day_summary_print_html(this.current_day_summary);
		const blob = new Blob([html], { type: "text/html;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		const name = (this.current_day_summary.pos_profile || "CMAT").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
		link.href = url;
		link.download = `${name}-Sales-Day-Summary.html`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	sales_day_summary_print_html(summary) {
		const rows = summary.rows || [];
		const payments = summary.payment_totals || [];
		const money = (value) => format_currency(flt(value || 0));
		const qty = (value) => flt(value || 0, 2);
		const esc = (value) => frappe.utils.escape_html(value == null ? "" : String(value));
		const letter_head = summary.letter_head || `<h2>${esc(summary.company || "CMAT GROUP LTD")}</h2>`;
		const row_html = rows.length
			? rows.map((row) => `
				<tr>
					<td><strong>${esc(row.item_name || row.item_code)}</strong><br><span>${esc(row.uom)}</span></td>
					<td>${qty(row.opening_stock)}</td>
					<td>${qty(row.additional_stock)}</td>
					<td>${qty(row.sold_qty)}</td>
					<td>${qty(row.staff_use_qty)}</td>
					<td>${qty(row.sample_qty)}</td>
					<td>${qty(row.loss_qty)}</td>
					<td>${qty(row.closing_stock)}</td>
					<td>${money(row.revenue)}</td>
				</tr>
			`).join("")
			: `<tr><td colspan="9" class="empty">${__("No stock movement found")}</td></tr>`;
		const payment_html = payments.length
			? payments.map((row) => `
				<tr>
					<td>${esc(row.mode_of_payment)}</td>
					<td>${money(row.amount)}</td>
				</tr>
			`).join("")
			: `<tr><td>${__("Payments")}</td><td>${money(0)}</td></tr>`;
		const declaration_html = `
			<tr><td>${__("System Sales Total")}</td><td>${money(summary.total_sales)}</td></tr>
			<tr><td>${__("Cash Deposited")}</td><td>${money(summary.cash_deposited)}</td></tr>
			<tr><td>${__("Mobile Money")}</td><td>${money(summary.mobile_money_amount)}</td></tr>
			<tr><td>${__("Total Declared")}</td><td>${money(summary.total_declared)}</td></tr>
			<tr><td>${__("Shortage")}</td><td>${money(summary.shortage)}</td></tr>
		`;

		return `<!doctype html>
			<html>
				<head>
					<meta charset="utf-8">
					<title>${esc(summary.pos_profile)} - ${__("Sales Day Summary")}</title>
					<style>
						@page { size: A4 portrait; margin: 12mm; }
						* { box-sizing: border-box; }
						body {
							margin: 0;
							background: #fff;
							color: #14211b;
							font-family: Arial, Helvetica, sans-serif;
							font-size: 12px;
							line-height: 1.35;
						}
						.report {
							width: 100%;
							max-width: 190mm;
							margin: 0 auto;
						}
						.letter-head {
							text-align: center;
							margin-bottom: 8mm;
						}
						.letter-head img {
							max-height: 26mm !important;
							max-width: 80mm !important;
							object-fit: contain;
						}
						h1 {
							margin: 0 0 2mm;
							font-size: 21px;
							text-align: center;
							text-transform: uppercase;
						}
						.meta {
							width: 100%;
							margin: 4mm 0 5mm;
							border: 1px solid #dce5df;
							border-radius: 6px;
							overflow: hidden;
						}
						.meta td {
							padding: 2mm 3mm;
							border-bottom: 1px solid #edf2ef;
						}
						.meta tr:last-child td { border-bottom: 0; }
						.meta td:first-child {
							width: 32mm;
							font-weight: 800;
							color: #69776f;
						}
						.cards {
							display: grid;
							grid-template-columns: repeat(5, 1fr);
							gap: 2mm;
							margin-bottom: 5mm;
						}
						.card {
							border: 1px solid #dce5df;
							border-radius: 6px;
							padding: 2.5mm;
							background: #f8faf7;
						}
						.card span {
							display: block;
							font-size: 9px;
							font-weight: 800;
							color: #69776f;
							text-transform: uppercase;
						}
						.card strong {
							display: block;
							margin-top: 1mm;
							font-size: 14px;
							color: #0f6b49;
						}
						table {
							width: 100%;
							border-collapse: collapse;
							page-break-inside: auto;
						}
						th {
							background: #0f6b49;
							color: #fff;
							padding: 2mm;
							text-align: right;
							font-size: 10px;
						}
						th:first-child,
						td:first-child { text-align: left; }
						td {
							padding: 2mm;
							border-bottom: 1px solid #edf2ef;
							text-align: right;
							vertical-align: top;
						}
						td span {
							color: #69776f;
							font-size: 10px;
						}
						.section-title {
							margin: 6mm 0 2mm;
							font-size: 14px;
							font-weight: 900;
						}
						.payments {
							width: 70mm;
							margin-left: auto;
						}
						.payments td:last-child {
							font-weight: 900;
							color: #0f6b49;
						}
						.signatures {
							display: grid;
							grid-template-columns: 1fr 1fr;
							gap: 18mm;
							margin-top: 16mm;
						}
						.signature {
							border-top: 1px solid #14211b;
							padding-top: 2mm;
							font-weight: 800;
						}
						@media print {
							body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
							.no-print { display: none !important; }
						}
					</style>
				</head>
				<body>
					<div class="report">
						<div class="letter-head">${letter_head}</div>
						<h1>${__("Sales Day Summary")}</h1>
						<table class="meta">
							<tr><td>${__("Shop")}</td><td>${esc(summary.pos_profile)}</td></tr>
							<tr><td>${__("Warehouse")}</td><td>${esc(summary.warehouse)}</td></tr>
							<tr><td>${__("Opening Entry")}</td><td>${esc(summary.opening_entry)}</td></tr>
							<tr><td>${__("Sales Invoice")}</td><td>${esc(summary.invoice || "")}</td></tr>
							<tr><td>${__("Period")}</td><td>${esc(summary.from_datetime)} - ${esc(summary.to_datetime)}</td></tr>
						</table>
						<div class="cards">
							<div class="card"><span>${__("Total Sales")}</span><strong>${money(summary.total_sales)}</strong></div>
							<div class="card"><span>${__("Qty Sold")}</span><strong>${qty(summary.total_qty_sold)}</strong></div>
							<div class="card"><span>${__("Staff Use")}</span><strong>${qty(summary.total_staff_use)}</strong></div>
							<div class="card"><span>${__("Sample")}</span><strong>${qty(summary.total_sample)}</strong></div>
							<div class="card"><span>${__("Loss")}</span><strong>${qty(summary.total_loss)}</strong></div>
						</div>
						<div class="section-title">${__("Stock And Sales Movement")}</div>
						<table>
							<thead>
								<tr>
									<th>${__("Item")}</th>
									<th>${__("Opening")}</th>
									<th>${__("Additional")}</th>
									<th>${__("Sold")}</th>
									<th>${__("Staff")}</th>
									<th>${__("Sample")}</th>
									<th>${__("Loss")}</th>
									<th>${__("Closing")}</th>
									<th>${__("Revenue")}</th>
								</tr>
							</thead>
							<tbody>${row_html}</tbody>
						</table>
						<div class="section-title">${__("Payments")}</div>
						<table class="payments">
							<tbody>${payment_html}</tbody>
						</table>
						<div class="section-title">${__("Cashier Money Declaration")}</div>
						<table class="payments">
							<tbody>${declaration_html}</tbody>
						</table>
						<div class="signatures">
							<div class="signature">${__("Cashier Signature")}</div>
							<div class="signature">${__("Finance Signature")}</div>
						</div>
					</div>
				</body>
			</html>`;
	}

	print_receipt() {
		if (!this.last_invoice || !this.last_invoice.print_url) return;
		window.open(this.last_invoice.print_url, "_blank");
	}
};
