using Microsoft.AspNetCore.Mvc.Filters;
using YL.Helpers;
using YL.Models.Dtos.Commons;

namespace YL.Filters
{
	public class AlbumSystemMasterAttribute : ActionFilterAttribute
	{
		public override void OnActionExecuting(ActionExecutingContext context)
		{
			var session = AlbumCookieHelper.GetSession(context.HttpContext.Request);

			if (session == null)
			{
				throw new CustomException(AlbumErrors.LoginRequired);
			}

			if (!session.IsSystemMaster)
			{
				throw new CustomException(AlbumErrors.Unauthorized);
			}

			base.OnActionExecuting(context);
		}
	}
}
