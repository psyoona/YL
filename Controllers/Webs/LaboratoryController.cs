using System.Security.Cryptography.Xml;
using Microsoft.AspNetCore.Mvc;
using YL.Models.BusinessLogicLayers;
using YL.Models.Dtos.Webs;

namespace YL.Controllers.Webs
{
	public class LaboratoryController : BaseController
	{
		public LaboratoryController(IConfiguration configuration) : base(configuration) { }

		[HttpGet]
		public ActionResult Tetris()
		{
			this.Initialize();

			return this.PartialView();
		}

		[HttpGet]
		public ActionResult EncryptionTool()
		{
			this.Initialize();

			return this.PartialView();
		}

		[HttpGet]
		public ActionResult ChatGptService()
		{
			this.Initialize();

			return this.PartialView();
		}

		[HttpGet]
		public ActionResult AccountBook()
		{
			this.Initialize();

			return this.PartialView();
		}

		[HttpPost]
		public JsonResult EncryptString(string plainText, int encryptType, string encryptKey)
		{
			string result = new LaboratoryBll().EncryptString(plainText, encryptType, encryptKey);

			return this.Json(new { result });
		}

		[HttpPost]
		public JsonResult DecryptString(string encryptedText, int encryptType, string encryptKey)
		{
			string result = new LaboratoryBll().DecryptString(encryptedText, encryptType, encryptKey);

			return this.Json(new { result });
		}

		[HttpPost]
		public JsonResult RequestChatGpt(string usingType, string usingKey, string message)
		{
			string result = new LaboratoryBll().RequestChatGpt(usingType, usingKey, message);

			return this.Json(new { result });
		}

		[HttpPost]
		public JsonResult GetAccountMainData()
		{
			AccountMainData result = new LaboratoryBll().GetAccountMainData();

			return this.Json(new { result });
		}

		[HttpPost]
		public JsonResult GetAccountHistory()
		{
			string result = new LaboratoryBll().GetAccountHistory();

			return this.Json(new { result });
		}
	}
}
