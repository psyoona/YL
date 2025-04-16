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

		[HttpGet]
		public ActionResult BaseConverter()
		{
			this.Initialize();

			return this.PartialView();
		}

		[HttpGet]
		public ActionResult ReactionTimeGame()
		{
			this.Initialize();

			return this.PartialView();
		}

		[HttpGet]
		public ActionResult UrlConversion()
		{
			this.Initialize();

			return this.PartialView();
		}

		[HttpGet]
		public ActionResult NumberGuessingGame()
		{
			this.Initialize();

			return this.PartialView();
		}

		[HttpPost]
		public JsonResult EncryptString(string plainText, int encryptType, string encryptKey)
		{
			string result = new LabService().EncryptString(plainText, encryptType, encryptKey);

			return this.Json(new { result });
		}

		[HttpPost]
		public JsonResult DecryptString(string encryptedText, int encryptType, string encryptKey)
		{
			string result = new LabService().DecryptString(encryptedText, encryptType, encryptKey);

			return this.Json(new { result });
		}

		[HttpPost]
		public JsonResult RequestChatGpt(string usingType, string usingKey, string message)
		{
			string result = new LabService().RequestChatGpt(usingType, usingKey, message);

			return this.Json(new { result });
		}

		[HttpPost]
		public JsonResult GetAccountMainData()
		{
			AccountMainData result = new LabService().GetAccountMainData();

			return this.Json(new { result });
		}

		[HttpPost]
		public JsonResult GetAccountHistory()
		{
			string result = new LabService().GetAccountHistory();

			return this.Json(new { result });
		}
	}
}
