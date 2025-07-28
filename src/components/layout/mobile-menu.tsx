"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Home, PlusCircle, LayoutDashboard, BookOpen, HelpCircle, Info, Lock } from "lucide-react"
import Link from "next/link"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const menuVariants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  }

  const linkVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  }

  const navItems = [
    { name: "Início", href: "/", icon: Home },
    { name: "Criar Trilha", href: "/create/questions", icon: PlusCircle },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Minhas Trilhas", href: "/path/123", icon: BookOpen }, // Placeholder
    { name: "Quizzes", href: "/quiz/123", icon: Lock }, // Placeholder
  ]

  return (
    <div className="relative z-50">
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md text-[#2D3748] hover:bg-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="x-icon"
              initial={{ rotate: 0 }}
              animate={{ rotate: 90 }}
              exit={{ rotate: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu-icon"
              initial={{ rotate: 0 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuVariants}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-64 bg-white shadow-lg p-6 flex flex-col border-l border-[#E2E8F0]"
          >
            <div className="flex justify-end mb-8">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-[#2D3748] hover:bg-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <ul className="space-y-4">
              {navItems.map((item, index) => (
                <motion.li
                  key={item.name}
                  variants={linkVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    onClick={toggleMenu}
                    className="flex items-center gap-3 p-3 rounded-lg text-[#718096] hover:bg-[#FFE5D9] hover:text-[#FF6B35] transition-colors duration-200"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>

            <div className="mt-auto pt-8 border-t border-[#F1F5F9] space-y-4">
              <Link
                href="#"
                onClick={toggleMenu}
                className="flex items-center gap-3 p-3 rounded-lg text-[#718096] hover:bg-[#F1F5F9] transition-colors duration-200"
              >
                <Info className="h-5 w-5" />
                <span className="font-medium">Sobre</span>
              </Link>
              <Link
                href="#"
                onClick={toggleMenu}
                className="flex items-center gap-3 p-3 rounded-lg text-[#718096] hover:bg-[#F1F5F9] transition-colors duration-200"
              >
                <HelpCircle className="h-5 w-5" />
                <span className="font-medium">Ajuda</span>
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}
