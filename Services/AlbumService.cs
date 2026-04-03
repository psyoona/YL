using System.Security.Cryptography;
using System.Text;
using SkiaSharp;
using YL.Configs;
using YL.Functions;
using YL.Models.Daos;
using YL.Models.Dtos.Webs;

namespace YL.Services
{
	public class AlbumService
	{
		private readonly string _albumBasePath;
		private readonly string _thumbnailCachePath;
		private const int ThumbnailMaxWidth = 1200;
		private const int ThumbnailMaxHeight = 900;
		private const int ThumbnailQuality = 95;

		private static readonly string[] ImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp" };

		public const string SystemMasterRole = "시스템 마스터";

		public AlbumService()
		{
			_albumBasePath = Path.Combine(ConfigManager.Settings.ServiceBasePath, "albums");
			_thumbnailCachePath = Path.Combine(ConfigManager.Settings.ServiceBasePath, "albums", ".thumbnails");
		}

		public (bool IsValid, string UserName, AlbumSession? Session) Authenticate(string phoneNumber, string password)
		{
			string passwordHash = ComputeSha256Hash(password);
			var user = new AlbumDao().Login(phoneNumber, passwordHash);

			if (!user.IsValid)
				return (false, "", null);

			var roles = new AlbumDao().GetUserRoles(phoneNumber);
			var roleNames = roles.Select(r => r.ROLE_NAME).ToList();
			var roleIds = roles.Select(r => r.ROLE_ID).ToList();

			var session = new AlbumSession
			{
				PhoneNumber = phoneNumber,
				UserName = user.UserName,
				Roles = string.Join(",", roleNames),
				RoleIds = string.Join(",", roleIds),
				IsSystemMaster = roleNames.Contains(SystemMasterRole),
				ServerVersion = VersionHelper.GetApplicationVersion()
			};

			return (true, user.UserName, session);
		}

		public void ValidateAlbumAccess(string albumName, AlbumSession session)
		{
			var roleNames = ParseRoleNames(session);
			var roleIds = ParseRoleIds(session);

			if (!HasAlbumAccess(albumName, roleNames, roleIds))
			{
				throw new UnauthorizedAccessException("접근 권한이 없습니다.");
			}
		}

		public List<AlbumInfo> GetAccessibleAlbums(AlbumSession session)
		{
			var roleNames = ParseRoleNames(session);
			var roleIds = ParseRoleIds(session);

			return GetAccessibleAlbums(roleNames, roleIds);
		}

		private bool IsSystemMaster(List<string> roleNames)
		{
			return roleNames.Contains(SystemMasterRole);
		}

		private bool HasAlbumAccess(string albumName, List<string> roleNames, List<int> roleIds)
		{
			if (this.IsSystemMaster(roleNames))
			{
				return true;
			}

			var accessList = new AlbumDao().GetAllAlbumAccess();
			var albumAccess = accessList.Where(a => a.ALBUM_NAME == albumName).ToList();

			if (albumAccess.Count == 0)
			{
				return true;
			}

			return albumAccess.Any(a => roleIds.Contains(a.ROLE_ID));
		}

		private List<AlbumInfo> GetAccessibleAlbums(List<string> roleNames, List<int> roleIds)
		{
			var allAlbums = this.GetAlbumList();

			if (this.IsSystemMaster(roleNames))
			{
				return allAlbums;
			}

			var accessList = new AlbumDao().GetAllAlbumAccess();

			return allAlbums.Where(album =>
			{
				var albumAccess = accessList.Where(a => a.ALBUM_NAME == album.ALBUM_NAME).ToList();

				if (albumAccess.Count == 0)
				{
					return true;
				}

				return albumAccess.Any(a => roleIds.Contains(a.ROLE_ID));
			}).ToList();
		}

		public List<AlbumInfo> GetAlbumList()
		{
			return new AlbumDao().GetAlbums();
		}

		public void CreateAlbum(string albumName, string displayName)
		{
			if (string.IsNullOrWhiteSpace(albumName))
			{
				throw new InvalidOperationException("앨범 폴더명을 입력해주세요.");
			}

			if (albumName.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
			{
				throw new InvalidOperationException("앨범 폴더명에 사용할 수 없는 문자가 포함되어 있습니다.");
			}

			if (albumName.StartsWith("."))
			{
				throw new InvalidOperationException("앨범 폴더명은 '.'으로 시작할 수 없습니다.");
			}

			if (string.IsNullOrWhiteSpace(displayName))
				displayName = albumName;

			if (!new AlbumDao().CreateAlbum(albumName, displayName))
			{
				throw new InvalidOperationException("앨범 생성에 실패했습니다. 이미 존재하는 이름입니다.");
			}

			string albumPath = Path.Combine(_albumBasePath, albumName);
			Directory.CreateDirectory(albumPath);
		}

		public void UpdateAlbum(string albumName, string displayName)
		{
			if (string.IsNullOrWhiteSpace(albumName) || string.IsNullOrWhiteSpace(displayName))
			{
				throw new InvalidOperationException("앨범명과 표시명을 입력해주세요.");
			}

			if (!new AlbumDao().UpdateAlbum(albumName, displayName))
			{
				throw new InvalidOperationException("앨범 수정에 실패했습니다.");
			}
		}

		public void DeleteAlbum(string albumName)
		{
			if (string.IsNullOrWhiteSpace(albumName))
			{
				throw new InvalidOperationException("앨범명을 입력해주세요.");
			}

			if (!new AlbumDao().DeleteAlbumFromDb(albumName))
			{
				throw new InvalidOperationException("앨범 삭제에 실패했습니다.");
			}

			string albumPath = Path.Combine(_albumBasePath, albumName);

			if (Directory.Exists(albumPath))
			{
				string trashDir = Path.Combine(_albumBasePath, ".trash");
				Directory.CreateDirectory(trashDir);
				string trashPath = Path.Combine(trashDir, $"{DateTime.Now:yyyyMMddHHmmss}_{albumName}");

				Directory.Move(albumPath, trashPath);
			}

			string thumbDir = Path.Combine(_thumbnailCachePath, albumName);

			if (Directory.Exists(thumbDir))
			{
				Directory.Delete(thumbDir, true);
			}
		}

		public List<AlbumPhoto> GetPhotoList(string albumName)
		{
			return new AlbumDao().GetPhotos(albumName);
		}

		public List<AlbumPhoto> UploadPhotos(string albumName, List<IFormFile> files)
		{
			var uploaded = new List<AlbumPhoto>();

			foreach (var file in files)
			{
				if (file.Length > 0)
				{
					uploaded.Add(UploadPhoto(albumName, file));
				}
			}

			return uploaded;
		}

		private AlbumPhoto UploadPhoto(string albumName, IFormFile file)
		{
			string albumPath = Path.Combine(_albumBasePath, albumName);
			Directory.CreateDirectory(albumPath);

			string extension = Path.GetExtension(file.FileName).ToLower();

			if (!ImageExtensions.Contains(extension))
			{
				throw new InvalidOperationException("지원하지 않는 이미지 형식입니다.");
			}

			string fileName = file.FileName;
			string targetPath = Path.Combine(albumPath, fileName);

			if (File.Exists(targetPath))
			{
				string nameWithout = Path.GetFileNameWithoutExtension(fileName);
				fileName = $"{nameWithout}_{DateTime.Now:yyyyMMddHHmmss}{extension}";
				targetPath = Path.Combine(albumPath, fileName);
			}

			using (var stream = new FileStream(targetPath, FileMode.Create))
			{
				file.CopyTo(stream);
			}

			int width = 0, height = 0;

			try
			{
				using var codec = SKCodec.Create(targetPath);

				if (codec != null)
				{
					width = codec.Info.Width;
					height = codec.Info.Height;
				}
			}
			catch { }

			long fileSize = new FileInfo(targetPath).Length;

			var dao = new AlbumDao();
			dao.UpsertPhoto(albumName, fileName, width, height, fileSize, 0);

			string thumbPath = Path.Combine(_thumbnailCachePath, albumName, fileName);

			if (File.Exists(thumbPath))
			{
				File.Delete(thumbPath);
			}

			return new AlbumPhoto
			{
				ALBUM_NAME = albumName,
				FILE_NAME = fileName,
				WIDTH = width,
				HEIGHT = height,
				FILE_SIZE = fileSize
			};
		}

		public void DeletePhoto(string albumName, string fileName, int photoId)
		{
			new AlbumDao().DeletePhoto(photoId);

			string sourcePath = Path.Combine(_albumBasePath, albumName, fileName);

			if (File.Exists(sourcePath))
			{
				string trashDir = Path.Combine(_albumBasePath, albumName, ".trash");
				Directory.CreateDirectory(trashDir);
				string trashPath = Path.Combine(trashDir, $"{DateTime.Now:yyyyMMddHHmmss}_{fileName}");

				File.Move(sourcePath, trashPath);
			}

			string thumbPath = Path.Combine(_thumbnailCachePath, albumName, fileName);

			if (File.Exists(thumbPath))
				File.Delete(thumbPath);
		}

		public (byte[] data, string contentType)? GetPhoto(string albumName, string fileName)
		{
			string filePath = Path.Combine(_albumBasePath, albumName, fileName);

			if (!ValidatePath(filePath))
			{
				return null;
			}

			byte[] data = File.ReadAllBytes(filePath);
			string contentType = GetContentType(fileName);

			return (data, contentType);
		}

		public (byte[] data, string contentType)? GetThumbnail(string albumName, string fileName)
		{
			string originalPath = Path.Combine(_albumBasePath, albumName, fileName);

			if (!ValidatePath(originalPath))
			{
				return null;
			}

			string thumbDir = Path.Combine(_thumbnailCachePath, albumName);
			string thumbPath = Path.Combine(thumbDir, fileName);

			if (File.Exists(thumbPath))
			{
				byte[] cachedData = File.ReadAllBytes(thumbPath);
				return (cachedData, "image/jpeg");
			}

			try
			{
				Directory.CreateDirectory(thumbDir);

				using var codec = SKCodec.Create(originalPath);
				if (codec == null)
				{
					return null;
				}

				var bitmap = SKBitmap.Decode(codec);
				if (bitmap == null)
				{
					return null;
				}

				var origin = codec.EncodedOrigin;
				if (origin != SKEncodedOrigin.TopLeft && origin != SKEncodedOrigin.Default)
				{
					var rotated = AutoOrient(bitmap, origin);
					bitmap.Dispose();
					bitmap = rotated;
				}

				float ratioX = (float)ThumbnailMaxWidth / bitmap.Width;
				float ratioY = (float)ThumbnailMaxHeight / bitmap.Height;
				float ratio = Math.Min(ratioX, ratioY);

				if (ratio >= 1.0f)
				{
					bitmap.Dispose();
					byte[] data = File.ReadAllBytes(originalPath);
					return (data, GetContentType(fileName));
				}

				int newWidth = (int)(bitmap.Width * ratio);
				int newHeight = (int)(bitmap.Height * ratio);

				using var resized = bitmap.Resize(new SKImageInfo(newWidth, newHeight), new SKSamplingOptions(SKCubicResampler.Mitchell));
				bitmap.Dispose();

				using var image = SKImage.FromBitmap(resized);
				using var encoded = image.Encode(SKEncodedImageFormat.Jpeg, ThumbnailQuality);

				byte[] thumbData = encoded.ToArray();
				File.WriteAllBytes(thumbPath, thumbData);

				return (thumbData, "image/jpeg");
			}
			catch
			{
				byte[] data = File.ReadAllBytes(originalPath);
				return (data, GetContentType(fileName));
			}
		}

		private static SKBitmap AutoOrient(SKBitmap bitmap, SKEncodedOrigin origin)
		{
			switch (origin)
			{
				case SKEncodedOrigin.BottomRight: // 180도
					{
						var rotated = new SKBitmap(bitmap.Width, bitmap.Height);
						using var canvas = new SKCanvas(rotated);
						canvas.RotateDegrees(180, bitmap.Width / 2f, bitmap.Height / 2f);
						canvas.DrawBitmap(bitmap, 0, 0);
						return rotated;
					}
				case SKEncodedOrigin.RightTop: // 90도 시계방향
					{
						var rotated = new SKBitmap(bitmap.Height, bitmap.Width);
						using var canvas = new SKCanvas(rotated);
						canvas.Translate(rotated.Width, 0);
						canvas.RotateDegrees(90);
						canvas.DrawBitmap(bitmap, 0, 0);
						return rotated;
					}
				case SKEncodedOrigin.LeftBottom: // 90도 반시계방향
					{
						var rotated = new SKBitmap(bitmap.Height, bitmap.Width);
						using var canvas = new SKCanvas(rotated);
						canvas.Translate(0, rotated.Height);
						canvas.RotateDegrees(-90);
						canvas.DrawBitmap(bitmap, 0, 0);
						return rotated;
					}
				case SKEncodedOrigin.TopRight: // 좌우 반전
					{
						var flipped = new SKBitmap(bitmap.Width, bitmap.Height);
						using var canvas = new SKCanvas(flipped);
						canvas.Scale(-1, 1, bitmap.Width / 2f, 0);
						canvas.DrawBitmap(bitmap, 0, 0);
						return flipped;
					}
				case SKEncodedOrigin.LeftTop: // 좌우 반전 + 90도 반시계
					{
						var result = new SKBitmap(bitmap.Height, bitmap.Width);
						using var canvas = new SKCanvas(result);
						canvas.Translate(0, result.Height);
						canvas.RotateDegrees(-90);
						canvas.Scale(-1, 1, bitmap.Width / 2f, 0);
						canvas.DrawBitmap(bitmap, 0, 0);
						return result;
					}
				case SKEncodedOrigin.RightBottom: // 좌우 반전 + 90도 시계
					{
						var result = new SKBitmap(bitmap.Height, bitmap.Width);
						using var canvas = new SKCanvas(result);
						canvas.Translate(result.Width, 0);
						canvas.RotateDegrees(90);
						canvas.Scale(-1, 1, bitmap.Width / 2f, 0);
						canvas.DrawBitmap(bitmap, 0, 0);
						return result;
					}
				case SKEncodedOrigin.BottomLeft: // 상하 반전
					{
						var flipped = new SKBitmap(bitmap.Width, bitmap.Height);
						using var canvas = new SKCanvas(flipped);
						canvas.Scale(1, -1, 0, bitmap.Height / 2f);
						canvas.DrawBitmap(bitmap, 0, 0);
						return flipped;
					}
				default:
					return bitmap.Copy();
			}
		}

		public List<AlbumRole> GetAllRoles()
		{
			return new AlbumDao().GetAllRoles();
		}

		public void AddRole(string roleName)
		{
			if (!new AlbumDao().AddRole(roleName))
			{
				throw new InvalidOperationException("이미 존재하는 역할입니다.");
			}
		}

		public void DeleteRole(int roleId)
		{
			if (!new AlbumDao().DeleteRole(roleId))
			{
				throw new InvalidOperationException("시스템 마스터 역할은 삭제할 수 없습니다.");
			}
		}

		public List<AlbumUserInfo> GetAllUsers()
		{
			return new AlbumDao().GetAllUsers();
		}

		public List<AlbumUserRoleMapping> GetAllUserRoles()
		{
			return new AlbumDao().GetAllUserRoles();
		}

		public void AssignUserRole(string phoneNumber, int roleId)
		{
			if (!new AlbumDao().AssignUserRole(phoneNumber, roleId))
			{
				throw new InvalidOperationException("이미 할당된 역할입니다.");
			}
		}

		public void RemoveUserRole(int userRoleId)
		{
			if (!new AlbumDao().RemoveUserRole(userRoleId))
			{
				throw new InvalidOperationException("역할 제거에 실패했습니다.");
			}
		}

		public List<AlbumAccessMapping> GetAllAlbumAccess()
		{
			return new AlbumDao().GetAllAlbumAccess();
		}

		public void AddAlbumAccess(string albumName, int roleId)
		{
			if (!new AlbumDao().AddAlbumAccess(albumName, roleId))
			{
				throw new InvalidOperationException("이미 설정된 접근 권한입니다.");
			}
		}

		public void RemoveAlbumAccess(int accessId)
		{
			if (!new AlbumDao().RemoveAlbumAccess(accessId))
			{
				throw new InvalidOperationException("접근 권한 제거에 실패했습니다.");
			}
		}

		private List<string> ParseRoleNames(AlbumSession session)
		{
			return session.Roles.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
		}

		private List<int> ParseRoleIds(AlbumSession session)
		{
			return session.RoleIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
				.Select(s => int.TryParse(s, out int id) ? id : 0)
				.Where(id => id > 0)
				.ToList();
		}

		private bool ValidatePath(string filePath)
		{
			if (!File.Exists(filePath))
			{
				return false;
			}

			string fullPath = Path.GetFullPath(filePath);
			string basePath = Path.GetFullPath(_albumBasePath);

			return fullPath.StartsWith(basePath);
		}

		private static string GetContentType(string fileName)
		{
			string extension = Path.GetExtension(fileName).ToLower();

			return extension switch
			{
				".jpg" or ".jpeg" => "image/jpeg",
				".png" => "image/png",
				".gif" => "image/gif",
				".webp" => "image/webp",
				".bmp" => "image/bmp",
				_ => "application/octet-stream"
			};
		}

		private string ComputeSha256Hash(string plainText)
		{
			byte[] bytes = Encoding.UTF8.GetBytes(plainText);
			byte[] hashBytes = SHA256.HashData(bytes);

			StringBuilder sb = new StringBuilder();

			foreach (byte b in hashBytes)
			{
				sb.Append($"{b:x2}");
			}

			return sb.ToString();
		}
	}
}