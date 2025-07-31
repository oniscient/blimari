"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

export interface Step {
  id: string
  title: string
  status: "completed" | "processing" | "pending"
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full max-w-md">
      {steps.map((step, index) => {
        return (
          <div key={step.id} className="flex relative pb-12 last:pb-0">
            {/* Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-5 top-5 -bottom-0 w-0.5 bg-gray-200" />
            )}

            {/* Circle */}
            <div className="flex-shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center z-10 relative ${
                  step.status === "completed"
                    ? "bg-[#FF6B35] text-white"
                    : step.status === "processing"
                      ? "border-2 border-[#FF6B35] text-[#FF6B35] bg-white"
                      : "border-2 border-gray-200 text-gray-400 bg-white"
                }`}
              >
                {step.status === "completed" ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
            </div>

            {/* Content */}
            <div className="ml-4">
              <h4
                className={`font-semibold ${
                  step.status === "pending" ? "text-gray-400" : "text-gray-900"
                }`}
              >
                {step.title}
              </h4>
              <p
                className={`text-sm px-2 py-0.5 rounded-full inline-block mt-1 ${
                  step.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : step.status === "processing"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
              </p>
              {step.description && (
                <p className="text-xs text-gray-400 mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}