import { z } from "zod";
import { fromError } from "zod-validation-error";

const TrimmedString = z.string().trim();
const NonEmptyString = TrimmedString.min(1);

export const SenyaScheme = z.object({
  body: z.object({
    url: NonEmptyString,
  }),
});

export const TiktokScheme = z.object({
  body: z.object({
    video: NonEmptyString,
  }),
});

export const InstagramScheme = z.object({
  body: z.object({
    post_id: NonEmptyString,
  }),
});

export const InstagramStoryScheme = z.object({
  body: z
    .object({
      url: TrimmedString.optional(),
      id: TrimmedString.optional(),
    })
    .refine((x) => x.url || x.id, "should be url or id"),
});

export const ThreadsScheme = z.object({
  body: z.object({
    url: NonEmptyString,
  }),
});

export const TwitterScheme = z.object({
  body: z.object({
    id: NonEmptyString,
  }),
});

function sendValidationError(res, validationResult) {
  res.status(400).json({
    ok: false,
    error: { code: 400, message: fromError(validationResult.error).toString() },
  });
}

export function validate(schema) {
  return (req, res, next) => {
    try {
      const validationResult = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (!validationResult.success) {
        sendValidationError(res, validationResult);
        return;
      }

      req.validatedBody = validationResult.data;
    } catch (error) {
      console.error(error);
      next(error);
      return;
    }

    next();
  };
}
