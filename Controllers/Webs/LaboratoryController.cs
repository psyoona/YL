using Microsoft.AspNetCore.Mvc;
using YL.Models.BusinessLogicLayers;

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

		[HttpPost]
		public JsonResult EncryptString(string plainText, string encryptType, string encryptKey)
		{
			string result = new LaboratoryBll().EncryptString(plainText, encryptType, encryptKey);

			return this.Json(new { result });
		}
	}
}
