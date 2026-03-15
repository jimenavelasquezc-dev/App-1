export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/Rappi_logo.svg" alt="Rappi" className="h-14 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Rappi Comp Manager</h1>
          <p className="text-gray-500 mt-1 text-sm">Compensaciones & Excepciones de Ventas</p>
        </div>
        {children}
      </div>
    </div>
  )
}
