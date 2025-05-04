using Microsoft.AspNetCore.Mvc;
using YL.Configs;
using YL.Functions;

namespace YL.Controllers.Webs
{
	public class BaseController : Controller
	{
		public BaseController() 
		{
		}

		protected void Initialize()
		{
			ViewBag.Title = "Yoon's lab";
			ViewBag.CacheVersion = VersionHelper.GetApplicationVersion();
			ViewBag.IsDebugEnabled = ConfigManager.IsDebugMode;

			if (ConfigManager.IsDebugMode)
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
