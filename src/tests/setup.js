import '@testing-library/jest-dom'

// Mock pdf-lib
vi.mock('pdf-lib', () => ({
  PDFDocument: {
    create: vi.fn().mockResolvedValue({
      copyPages: vi.fn().mockResolvedValue([]),
      addPage: vi.fn(),
      getPageIndices: vi.fn().mockReturnValue([0]),
      save: vi.fn().mockResolvedValue(new Uint8Array([1,2,3])),
      embedJpg: vi.fn().mockResolvedValue({}),
    }),
    load: vi.fn().mockResolvedValue({
      copyPages: vi.fn().mockResolvedValue([]),
      getPageIndices: vi.fn().mockReturnValue([0]),
      getPages: vi.fn().mockReturnValue([]),
    }),
  },
  StandardFonts: { Helvetica: 'Helvetica' },
  rgb: vi.fn().mockReturnValue({}),
}))

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock window.alert
global.alert = vi.fn()
