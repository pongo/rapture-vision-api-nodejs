export function parseTiktokUrl(
  url: string,
):
  | { shortcode: string; id?: never; username?: never }
  | { shortcode?: never; id: string; username: string }
  | { shortcode?: never; id: string; username?: never }
  | { shortcode?: never; id?: never; username?: never };

//| { username?: string; id: string; shortcode?: never };
