using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using YL.Helpers;

namespace YL.Filters
{
	public class StockLoginRequiredAttribute : ActionFilterAttribute
	{
		public override void OnActionExecuting(ActionExecutingContext context)
		{
			var session = StockCookieHelper.GetSession(context.HttpContext.Request);

			if (session == null)
			{
				context.Result = new RedirectToActionResult("Login", "Stock", null);
				return;
			}

			base.OnActionExecuting(context);
		}
	}
}
