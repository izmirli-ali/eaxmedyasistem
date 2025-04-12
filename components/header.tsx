// components/header.tsx
import type React from "react"

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a href="/" className="text-red-600 font-bold text-xl">
          İşletme Yönetim Sistemi
        </a>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a href="/isletmeler" className="text-red-500 hover:text-red-700">
                İşletmeler
              </a>
            </li>
            <li>
              <a href="/musteriler" className="text-red-500 hover:text-red-700">
                Müşteriler
              </a>
            </li>
            <li>
              <a href="/profil" className="text-red-500 hover:text-red-700">
                Profil
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
