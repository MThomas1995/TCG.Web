interface Env {
    NEXT_PUBLIC_TCG_API_URL: string
}

// Validate environment variables at import time
function validateEnv(): Env {
    const { NEXT_PUBLIC_TCG_API_URL } = process.env
    if (!NEXT_PUBLIC_TCG_API_URL) throw new Error("Missing env var: NEXT_PUBLIC_TCG_API_URL")
    return { NEXT_PUBLIC_TCG_API_URL }
}

export const env = validateEnv()
