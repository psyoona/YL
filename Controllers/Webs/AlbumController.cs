using Microsoft.AspNetCore.Mvc;
using YL.Filters;
using YL.Models.Dtos.Webs;
using YL.Services;

namespace YL.Controllers.Webs
{
	public class AlbumController : BaseController
	{
		public AlbumController() { }

		[HttpGet]
		public ActionResult Login()
		{
			this.Initialize();

			if (this.IsLoggedIn())
			{
				return this.RedirectToAction("Index");
			}

			return this.View();
		}

		[HttpPost]
		public JsonResult Authenticate(string phoneNumber, string password)
		{
			var service = new AlbumService();
			AlbumUser result = service.Login(phoneNumber, password);

			if (result.IsValid)
			{
				HttpContext.Session.SetString("AlbumUserPhone", phoneNumber);
				HttpContext.Session.SetString("AlbumUserName", result.UserName);

				var roles = service.GetUserRoles(phoneNumber);
				var roleNames = roles.Select(r => r.ROLE_NAME).ToList();
				var roleIds = roles.Select(r => r.ROLE_ID).ToList();

				HttpContext.Session.SetString("AlbumUserRoles", string.Join(",", roleNames));
				HttpContext.Session.SetString("AlbumUserRoleIds", string.Join(",", roleIds));
				HttpContext.Session.SetString("AlbumIsSystemMaster",
					roleNames.Contains(AlbumService.SystemMasterRole) ? "true" : "false");
			}

			return this.Json(new { success = result.IsValid, userName = result.UserName });
		}

		[HttpGet]
		public ActionResult Logout()
		{
			HttpContext.Session.Remove("AlbumUserPhone");
			HttpContext.Session.Remove("AlbumUserName");
			HttpContext.Session.Remove("AlbumUserRoles");
			HttpContext.Session.Remove("AlbumUserRoleIds");
			HttpContext.Session.Remove("AlbumIsSystemMaster");

			return this.RedirectToAction("Login");
		}

		[HttpGet]
		public ActionResult Index()
		{
			this.Initialize();

			if (!this.IsLoggedIn())
			{
				return this.RedirectToAction("Login");
			}

			ViewBag.UserName = HttpContext.Session.GetString("AlbumUserName");
			ViewBag.IsSystemMaster = this.IsSystemMaster();

			return this.View();
		}

		[HttpPost]
		[AlbumLoginRequired]
		public JsonResult GetAlbumList()
		{
			var service = new AlbumService();
			var roleNames = this.GetSessionRoleNames();
			var roleIds = this.GetSessionRoleIds();

			var albums = service.GetAccessibleAlbums(roleNames, roleIds);

			return this.Json(new { albums });
		}

		[HttpPost]
		[AlbumLoginRequired]
		public JsonResult GetPhotoList(string albumName)
		{
			if (!this.HasAccess(albumName))
			{
				return this.Json(new { photos = new List<object>(), error = "접근 권한이 없습니다." });
			}

			var photos = new AlbumService().GetPhotoList(albumName);

			return this.Json(new { photos });
		}

		[HttpGet]
		[AlbumLoginRequired]
		[ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Client)]
		public ActionResult GetPhoto(string albumName, string fileName)
		{
			if (!this.HasAccess(albumName))
			{
				return this.Forbid();
			}

			var result = new AlbumService().GetPhoto(albumName, fileName);

			if (result == null)
			{
				return this.NotFound();
			}

			return this.File(result.Value.data, result.Value.contentType);
		}

		[HttpGet]
		[AlbumLoginRequired]
		[ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Client)]
		public ActionResult GetThumbnail(string albumName, string fileName)
		{
			if (!this.HasAccess(albumName))
			{
				return this.Forbid();
			}

			var result = new AlbumService().GetThumbnail(albumName, fileName);

			if (result == null)
			{
				return this.NotFound();
			}

			return this.File(result.Value.data, result.Value.contentType);
		}

		[HttpPost]
		[AlbumLoginRequired]
		[RequestSizeLimit(50_000_000)]
		public JsonResult UploadPhotos(string albumName, List<IFormFile> files)
		{
			if (!this.HasAccess(albumName))
			{
				return this.Json(new { success = false, error = "접근 권한이 없습니다." });
			}

			var service = new AlbumService();
			var uploaded = new List<object>();

			foreach (var file in files)
			{
				if (file.Length > 0)
				{
					var photo = service.UploadPhoto(albumName, file);
					uploaded.Add(photo);
				}
			}

			return this.Json(new { success = true, photos = uploaded });
		}

		[HttpPost]
		[AlbumLoginRequired]
		public JsonResult DeletePhoto(string albumName, string fileName, int photoId)
		{
			if (!this.HasAccess(albumName))
			{
				return this.Json(new { success = false, error = "접근 권한이 없습니다." });
			}

			bool result = new AlbumService().DeletePhoto(albumName, fileName, photoId);

			return this.Json(new { success = result });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult CreateAlbum(string albumName, string displayName)
		{
			bool result = new AlbumService().CreateAlbum(albumName, displayName);

			return this.Json(new { success = result, error = result ? "" : "앨범 생성에 실패했습니다. 이미 존재하거나 유효하지 않은 이름입니다." });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult UpdateAlbum(string albumName, string displayName)
		{
			bool result = new AlbumService().UpdateAlbum(albumName, displayName);

			return this.Json(new { success = result, error = result ? "" : "앨범 수정에 실패했습니다." });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult DeleteAlbum(string albumName)
		{
			bool result = new AlbumService().DeleteAlbum(albumName);

			return this.Json(new { success = result, error = result ? "" : "앨범 삭제에 실패했습니다." });
		}

		[HttpGet]
		public ActionResult Admin()
		{
			this.Initialize();

			if (!this.IsLoggedIn())
			{
				return this.RedirectToAction("Login");
			}

			if (!this.IsSystemMaster())
			{
				return this.RedirectToAction("Index");
			}

			ViewBag.UserName = HttpContext.Session.GetString("AlbumUserName");

			return this.View();
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult GetRoles()
		{
			var roles = new AlbumService().GetAllRoles();
			return this.Json(new { success = true, roles });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult AddRole(string roleName)
		{
			bool result = new AlbumService().AddRole(roleName);
			return this.Json(new { success = result, error = result ? "" : "이미 존재하는 역할입니다." });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult DeleteRole(int roleId)
		{
			bool result = new AlbumService().DeleteRole(roleId);
			return this.Json(new { success = result, error = result ? "" : "시스템 마스터 역할은 삭제할 수 없습니다." });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult GetUsers()
		{
			var service = new AlbumService();
			var users = service.GetAllUsers();
			var userRoles = service.GetAllUserRoles();
			return this.Json(new { success = true, users, userRoles });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult AssignUserRole(string phoneNumber, int roleId)
		{
			bool result = new AlbumService().AssignUserRole(phoneNumber, roleId);
			return this.Json(new { success = result, error = result ? "" : "이미 할당된 역할입니다." });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult RemoveUserRole(int userRoleId)
		{
			bool result = new AlbumService().RemoveUserRole(userRoleId);
			return this.Json(new { success = result });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult GetAlbumAccess()
		{
			var service = new AlbumService();
			var accessList = service.GetAllAlbumAccess();
			var albums = service.GetAlbumList();
			var roles = service.GetAllRoles();

			return this.Json(new { success = true, accessList, albums, roles });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult AddAlbumAccess(string albumName, int roleId)
		{
			bool result = new AlbumService().AddAlbumAccess(albumName, roleId);

			return this.Json(new { success = result, error = result ? "" : "이미 설정된 접근 권한입니다." });
		}

		[HttpPost]
		[AlbumSystemMaster]
		public JsonResult RemoveAlbumAccess(int accessId)
		{
			bool result = new AlbumService().RemoveAlbumAccess(accessId);

			return this.Json(new { success = result });
		}

		private bool HasAccess(string albumName)
		{
			var service = new AlbumService();
			var roleNames = this.GetSessionRoleNames();
			var roleIds = this.GetSessionRoleIds();

			return service.HasAlbumAccess(albumName, roleNames, roleIds);
		}

		private bool IsLoggedIn()
		{
			return HttpContext.Session.GetString("AlbumUserPhone") != null;
		}

		private bool IsSystemMaster()
		{
			return HttpContext.Session.GetString("AlbumIsSystemMaster") == "true";
		}

		private List<string> GetSessionRoleNames()
		{
			string roles = HttpContext.Session.GetString("AlbumUserRoles") ?? "";
			return roles.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
		}

		private List<int> GetSessionRoleIds()
		{
			string ids = HttpContext.Session.GetString("AlbumUserRoleIds") ?? string.Empty;

			return ids.Split(',', StringSplitOptions.RemoveEmptyEntries)
				.Select(s => int.TryParse(s, out int id) ? id : 0)
				.Where(id => id > 0)
				.ToList();
		}
	}
}
