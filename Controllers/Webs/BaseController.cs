using Microsoft.AspNetCore.Mvc;
using YL.Models.Functions;

namespace YL.Controllers.Webs
{
	public class BaseController : Controller
	{
		public BaseController(IConfiguration configuration) 
		{
			if (CustomConfig.AppSettings == null)
			{
				CustomConfig.AppSettings = configuration;
			}
		}

		protected void Initialize()
		{
			ViewBag.Title = "Yoon's lab";
			ViewBag.CacheVersion = VersionHelper.GetApplicationVersion();
			ViewBag.IsDebugEnabled = Global.IsDebugMode;

			if (Global.IsDebugMode)
			{
				ViewBag.ScriptMin = string.Empty;
			}
			else
			{
				ViewBag.ScriptMin = ".min";
			}
		}
	}
}
