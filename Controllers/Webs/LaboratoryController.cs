using Microsoft.AspNetCore.Mvc;

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
	}
}
