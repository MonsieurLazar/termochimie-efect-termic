import { redirect } from "@sveltejs/kit"

export const load = () => {
  throw redirect(
    302,
    "https://docs.google.com/presentation/d/1s73dMfRmf_PmP9lRd_SESQ0_I6x4zX5P5A4g_ZULhPM/edit?usp=sharing",
  )
}
