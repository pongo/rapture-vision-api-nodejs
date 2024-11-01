import * as v from "@badrap/valita";

const TrimmedString = v.string().map((x) => x.trim());
const NonEmptyString = TrimmedString.assert((s) => s.length > 0, "empty");

export const SenyaScheme = v.object({
  url: NonEmptyString,
});

export const TiktokScheme = v.object({
  video: NonEmptyString,
});

export const Instagram1Scheme = v
  .object({
    url: TrimmedString.optional(),
    post_id: TrimmedString.optional(),
  })
  .assert((x) => x.url || x.post_id, "should be post_id or url");

export const Instagram2Scheme = v.object({
  post_id: NonEmptyString,
});

export const InstagramStoryScheme = v
  .object({
    url: TrimmedString.optional(),
    id: TrimmedString.optional(),
  })
  .assert((x) => x.url || x.id, "should be url or id");

export const ThreadsScheme = v.object({
  url: NonEmptyString,
});

export const TwitterScheme = v.object({
  id: NonEmptyString,
});

function sendValidationError(res, validationResult) {
  res.status(400).json({ ok: false, error: { code: 400, message: validationResult.message } });
}

export function validate(schema) {
  return (req, res, next) => {
    try {
      const validationResult = schema.try(req.body);
      if (!validationResult.ok) {
        sendValidationError(res, validationResult);
        return;
      }

      req.validatedBody = validationResult.value;
    } catch (error) {
      console.error(error);
      next(error);
      return;
    }

    next();
  };
}
