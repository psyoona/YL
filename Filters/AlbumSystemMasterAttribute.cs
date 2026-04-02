using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace YL.Filters
{
	public class AlbumSystemMasterAttribute : ActionFilterAttribute
	{
		public override void OnActionExecuting(ActionExecutingContext context)
		{
			var session = context.HttpContext.Session;

			if (session.GetString("AlbumUserPhone") == null)
			{
				context.Result = new JsonResult(new { message = "로그인이 필요합니다." });
				return;
			}

			if (session.GetString("AlbumIsSystemMaster") != "true")
			{
				context.Result = new JsonResult(new { success = false, error = "권한이 없습니다." });
				return;
			}

			base.OnActionExecuting(context);
		}
	}
}
