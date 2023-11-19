class PageNavigation {
	// Private vairables

	// Public Const

	// Private const

	// Public event functions

	// Private event functions

	// Private variables

	// Public functions
	moveToCommonNoticeWrite() {
		this.#movePageProcess('/Notice/CommonNoticeWrite');
	}

	moveToCommonNoticeMain(showConfirm) {
		this.#movePageConfirmProcess('/Notice/CommonNoticeMain', showConfirm);
	}

	moveToInspectionStatusMain() {
		this.#movePageProcess('/StatusManagement/InspectionStatusMain');
	}

	modalToInitializePassword() {
		this.#modalViewProcess('/InitializePassword');
	}

	modalToAuthorizeSms() {
		this.#modalViewProcess('/AuthorizeSms');
	}

	modalToInspectionStatusView() {
		this.#modalViewProcess('StatusManagement/InspectionStatusView');
	}

	moveToAccessLogMain() {
		this.#movePageProcess('/SystemManagement/AccessLogMain');
	}

	moveToDataLogMain() {
		this.#movePageProcess('/SystemManagement/DataLogMain');
	}

	moveToErrorLogMain() {
		this.#movePageProcess('/SystemManagement/ErrorLogMain');
	}

	moveToInspectionItemMain(showConfirm) {
		this.#movePageConfirmProcess('/SystemManagement/InspectionItemMain', showConfirm);
	}

	moveToCommonNoticeView() {
		this.#movePageProcess('/Notice/CommonNoticeView');
	}

	moveToInspectionItemView() {
		this.#movePageProcess('/SystemManagement/InspectionItemView');
	}

	moveToInspectionItemNew() {
		this.#movePageProcess('/SystemManagement/InspectionItemNew');
	}

	moveToUnitCodeMain(showConfirm) {
		this.#movePageConfirmProcess('/SystemManagement/UnitCodeMain', showConfirm);
	}

	moveToUnitCodeNew() {
		this.#movePageProcess('/SystemManagement/UnitCodeNew');
	}

	moveToAdminMenuMain() {
		this.#movePageProcess('/SystemManagement/AdminMenuMain');
	}

	moveToAdminMenuNew() {
		this.#movePageProcess('/SystemManagement/AdminMenuNew');
	}

	moveToUserMenuMain() {
		this.#movePageProcess('/SystemManagement/UserMenuMain');
	}

	moveToAppLogManagementMain() {
		this.#movePageProcess('/SystemManagement/AppLogManagementMain');
	}

	moveToInspectionMasterMain(showConfirm) {
		this.#movePageConfirmProcess('/UpdateManagement/InspectionMasterMain', showConfirm);
	}

	moveToInspectionMasterNew() {
		this.#movePageProcess('/UpdateManagement/InspectionMasterNew');
	}

	moveToDiagnosticMasterMain(showConfirm) {
		this.#movePageConfirmProcess('/UpdateManagement/DiagnosticMasterMain', showConfirm);
	}

	moveToDiagnosticMasterNew() {
		this.#movePageProcess('/UpdateManagement/DiagnosticMasterNew');
	}

	moveToLutTabFileMain(showConfirm) {
		this.#movePageConfirmProcess('/UpdateManagement/LutTabFileMain', showConfirm);
	}

	moveToLutTabFileNew() {
		this.#movePageProcess('/UpdateManagement/LutTabFileNew');
	}

	moveToPimFirmwareMain(showConfirm) {
		this.#movePageConfirmProcess('/UpdateManagement/PimFirmwareMain', showConfirm);
	}

	moveToPimFirmwareNew() {
		this.#movePageProcess('/UpdateManagement/PimFirmwareNew');
	}

	moveToCommAppMain(showConfirm) {
		this.#movePageConfirmProcess('/UpdateManagement/CommAppMain', showConfirm);
	}

	moveToCommAppNew() {
		this.#movePageProcess('/UpdateManagement/CommAppNew');
	}

	moveToPdiAppMain(showConfirm) {
		this.#movePageConfirmProcess('/UpdateManagement/PdiAppMain', showConfirm);
	}

	moveToPdiAppNew() {
		this.#movePageProcess('/UpdateManagement/PdiAppNew');
	}

	moveToVciSecondFirmwareMain(showConfirm) {
		this.#movePageConfirmProcess('/UpdateManagement/VciSecondFirmwareMain', showConfirm);
	}

	moveToVciSecondFirmwareNew() {
		this.#movePageProcess('/UpdateManagement/VciSecondFirmwareNew');
	}

	moveToWarehousingStatusMain(showConfirm) {
		this.#movePageConfirmProcess('/StatusManagement/WarehousingStatusMain', showConfirm);
	}

	modalToWarehousingStatusView() {
		this.#modalViewProcess('StatusManagement/WarehousingStatusView');
	}

	moveToInspectionSheetMain(showConfirm) {
		this.#movePageConfirmProcess('/ServiceManagement/InspectionSheetMain', showConfirm);
	}

	moveToInspectionSheetNew() {
		this.#movePageProcess('/ServiceManagement/InspectionSheetNew');
	}

	moveToInspectionSheetStep1View(showConfirm) {
		this.#movePageConfirmProcess('/ServiceManagement/InspectionSheetStep1View', showConfirm);
	}

	moveToInspectionSheetStep1ItemOrderEdit() {
		this.#movePageProcess('/ServiceManagement/InspectionSheetStep1ItemOrderEdit');
	}

	moveToInspectionSheetStep2View(showConfirm) {
		this.#movePageConfirmProcess('/ServiceManagement/InspectionSheetStep2View', showConfirm);
	}

	moveToInspectionSheetStep2ItemOrderEdit() {
		this.#movePageProcess('/ServiceManagement/InspectionSheetStep2ItemOrderEdit');
	}

	moveToInspectionSheetCertificateView(showConfirm) {
		this.#movePageConfirmProcess('/ServiceManagement/InspectionSheetCertificateView', showConfirm);
	}

	moveToInspectionNgStatusMain(showConfirm) {
		this.#movePageConfirmProcess('/StatusManagement/InspectionNgStatusMain', showConfirm);
	}

	moveToInspectionSheetCertificateItemOrderEdit() {
		this.#movePageProcess('/ServiceManagement/InspectionSheetCertificateItemOrderEdit');
	}

	moveToUserMain(showConfirm) {
		this.#movePageConfirmProcess('/ServiceManagement/UserMain', showConfirm);
	}

	moveToUserView() {
		this.#movePageProcess('/ServiceManagement/UserView');
	}

	moveToDeviceMain(showConfirm) {
		this.#movePageConfirmProcess('/ServiceManagement/DeviceMain', showConfirm);
	}

	moveToDeviceView() {
		this.#movePageProcess('/ServiceManagement/DeviceView');
	}

	modalToInspectionSheetCertificateItemEdit() {
		this.#modalViewProcess('ServiceManagement/InspectionSheetCertificateItemEdit');
	}

	modalToInspectionSheetCertificateItemNew() {
		this.#modalViewProcess('ServiceManagement/InspectionSheetCertificateItemNew');
	}

	modalToInspectionSheetStep1ItemNew() {
		this.#modalViewProcess('ServiceManagement/InspectionSheetStep1ItemNew');
	}

	modalToInspectionSheetStep1ItemEdit() {
		this.#modalViewProcess('ServiceManagement/InspectionSheetStep1ItemEdit');
	}

	modalToInspectionSheetStep2ItemEdit() {
		this.#modalViewProcess('ServiceManagement/InspectionSheetStep2ItemEdit');
	}

	modalToInspectionSheetStep2ItemNew() {
		this.#modalViewProcess('ServiceManagement/InspectionSheetStep2ItemNew');
	}

	modalToVisualInspectionResultDetailView() {
		this.#modalDepth2ViewProcess('StatusManagement/VisualInspectionResultDetailView');
	}

	moveToMyPage() {
		screenUtility.inactiveFirstMenuEffect();
		screenUtility.inactiveSecondMenuEffect();
		this.#movePageProcess('/Personal/MyPage');
	}

	moveToDefaultPage() {
		screenUtility.activeFirstMenuEffect($('#tmenu_1'));
		screenUtility.activeSecondMenuEffect($('div > a > span[data-language-code="L0069"]').closest('a'));
		pageNavigation.moveToCommonNoticeMain();
	}

	// Private functions
	#modalViewProcess(url) {
		webServer.getHtml(
			url,
			null,
			(response) => {
				$('#popupContents').children().remove();
				$(response).appendTo('#popupContents');
			}
		);
	}

	#modalDepth2ViewProcess(url) {
		webServer.getHtml(
			url,
			null,
			(response) => {
				$('#popupDetailContents').children().remove();
				$(response).appendTo('#popupDetailContents');
			}
		);
	}

	#movePageProcess(url) {
		webServer.getHtml(
			url,
			null,
			(response) => {
				if (response) {
					screenUtility.changeContents(response);
				}
			});
	}

	#movePageConfirmProcess(url, showConfirm) {
		if (showConfirm) {
			let options = {
				message: messageUtility.getMessage('L1024'),
				type: messageUtility.TYPES.QUESTION,
				confirmCallback: () => {
					webServer.getHtml(
						url,
						null,
						(response) => {
							if (response) {
								screenUtility.changeContents(response);
							}
						});
				}
			}

			screenUtility.showDialog(options);
		} else {
			webServer.getHtml(
				url,
				null,
				(response) => {
					if (response) {
						screenUtility.changeContents(response);
					}
				});
		}
	}
};

let pageNavigation = new PageNavigation();