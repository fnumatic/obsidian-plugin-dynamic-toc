import { vi } from "vitest";

// Dummy obsidian mock
export const parseLinktext = vi.fn((link: string) => ({ path: link, subpath: undefined }));