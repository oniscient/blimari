"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "@stackframe/stack"
import {
  Search,
  Download,
  Filter,
  CheckCircle,
  Loader2,
  LogIn,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { ContentCard } from "@/src/components/ContentCard"
import { ContentDetailsPopup } from "@/src/components/ContentDetailsPopup"
import { Stepper, Step } from "@/src/components/ui/Stepper"
import Loader from "@/src/components/ui/loading"
import { ContentItem, OrganizedTrail, TrailSection, LearningPath } from "@/src/types" // Importar tipos
import { audioService } from "@/src/services/audio.service";
import { useTranslation } from 'react-i18next';

interface ProcessingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: "pending" | "processing" | "completed"
  progress: number
  content?: ContentItem[] // Conteúdo descoberto/filtrado
  organizedTrail?: OrganizedTrail // Trilha organizada
}

export default function ProcessingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useUser()
  const [topic, setTopic] = useState<string>("")
  const [answers, setAnswers] = useState<string[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)
  const [discoveredContent, setDiscoveredContent] = useState<ContentItem[]>([])
  const [organizedTrail, setOrganizedTrail] = useState<OrganizedTrail | null>(null) // Novo estado para a trilha organizada
  const [isComplete, setIsComplete] = useState(false)
  const hasStarted = useRef(false)
  const discoveredContentRef = useRef<ContentItem[]>([]) // Ref para manter dados atualizados
  const organizedTrailRef = useRef<OrganizedTrail | null>(null) // Ref para a trilha organizada
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const { t, i18n } = useTranslation();

  // Atualizar ref sempre que discoveredContent mudar
  useEffect(() => {
    discoveredContentRef.current = discoveredContent
  }, [discoveredContent])

  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: "search",
      title: t('searching_content'),
      description: t('searching_resources_description'),
      icon: <Search className="w-6 h-6" />,
      status: "pending",
      progress: 0,
    },
    {
      id: "filter",
      title: t('filtering_quality'),
      description: t('analyzing_relevance_description'),
      icon: <Filter className="w-6 h-6" />,
      status: "pending",
      progress: 0,
    },
    {
      id: "organize",
      title: t('organizing_trail'),
      description: t('structuring_content_description'),
      icon: <Download className="w-6 h-6" />,
      status: "pending",
      progress: 0,
    },
    {
      id: "finalize",
      title: t('finalizing'),
      description: t('preparing_trail_description'),
      icon: <CheckCircle className="w-6 h-6" />,
      status: "pending",
      progress: 0,
    },
  ])

  useEffect(() => {
    const topicParam = searchParams.get("topic")
    const answersParam = searchParams.get("answers")
    const sourcesParam = searchParams.get("sources")

    if (topicParam) setTopic(topicParam)
    if (answersParam) {
      try {
        const parsedAnswers = JSON.parse(answersParam)
        setAnswers(Array.isArray(parsedAnswers) ? parsedAnswers : Object.values(parsedAnswers))
      } catch (error) {
        console.error(t('error_parsing_answers'), error)
      }
    }
    if (sourcesParam) {
      try {
        setSources(JSON.parse(sourcesParam))
      } catch (error) {
        console.error(t('error_parsing_sources'), error)
      }
    }
  }, [searchParams, t])

  const processStep = useCallback(
    async (stepIndex: number) => {
      const step = steps[stepIndex]
      if (!step) return

      console.log(`${t('starting_step')} ${stepIndex}: ${step.id}`)

      // Update step to processing
      setSteps((prev) =>
        prev.map((s, i) => (i === stepIndex ? { ...s, status: "processing" as const } : s)),
      )

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        setOverallProgress((stepIndex * 100 + progress) / steps.length)
      }

      // Process specific steps
      if (step.id === "search") {
        try {
          console.log(`${t('search_step_fetching_content')}`, { topic, sources, answers })
          
          const response = await fetch("/api/content/discover", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, sources, answers, userId: user?.id, language: i18n.language }),
          })

          if (response.ok) {
            const data = await response.json()
            const contentData = data.content || []
            console.log(`${t('search_step_received_content')}`, contentData)
            
            setDiscoveredContent(contentData)
            discoveredContentRef.current = contentData // Atualizar ref imediatamente
          } else {
            console.error(`${t('search_step_api_not_ok')}`, response.status, response.statusText)
          }
        } catch (error) {
          console.error(`${t('search_step_error_discovering')}`, error)
        }
      } else if (step.id === "filter") {
        try {
          // Usar o ref que tem os dados mais atualizados
          const currentContent = discoveredContentRef.current
          console.log(`${t('filter_step_current_discovered_content')}`, currentContent)

          if (currentContent.length === 0) {
            console.warn(`${t('filter_step_no_content_to_filter')}`)
            return
          }

          const payload = {
            contentList: currentContent.map(({ id, title, description, source, type, duration, author, rating}) => ({ id, title, description, source, type, duration, author, rating })),
            topic,
            answers,
          }
          console.log(`${t('filter_step_sending_payload')}`, payload)

          const response = await fetch("/api/content/filter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, language: i18n.language }),
          })

          if (response.ok) {
            const data = await response.json()
            const approvedIds = data.approvedContentIds || []
            console.log(`${t('filter_step_received_approved_ids')}`, approvedIds)

            setDiscoveredContent((prevContent) =>
              prevContent.map((item) => ({
                ...item,
                isApproved: approvedIds.includes(item.id),
              })),
            )
          } else {
            console.error(`${t('filter_step_api_not_ok')}`, response.status, response.statusText)
            // Fallback: approve all if filtering fails
            setDiscoveredContent((prevContent) =>
              prevContent.map((item) => ({ ...item, isApproved: true })),
            )
          }
        } catch (error) {
          console.error(`${t('filter_step_error_filtering')}`, error)
          // Fallback: approve all if filtering fails
          setDiscoveredContent((prevContent) =>
            prevContent.map((item) => ({ ...item, isApproved: true })),
          )
        }
      } else if (step.id === "organize") {
        try {
          const approvedContent = discoveredContentRef.current.filter((item) => item.isApproved)
          console.log(`${t('organize_step_approved_content')}`, approvedContent)

          if (approvedContent.length === 0) {
            console.warn(`${t('organize_step_no_approved_content')}`)
            return
          }

          const payload = {
            contentList: approvedContent.map(({ id, title, description, url, source, type, duration, author, rating, thumbnail }) => ({ id, title, description, url, source, type, duration, author, rating, thumbnail })),
            topic,
            answers,
          }
          console.log(`${t('organize_step_sending_payload')}`, payload)

          const response = await fetch("/api/content/organize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, language: i18n.language }),
          })

          if (response.ok) {
            const data = await response.json()
            const organizedTrailData: OrganizedTrail = data.organizedTrail || { organizedTrail: [] }
            console.log(`${t('organize_step_received_organized_trail')}`, organizedTrailData)

            // Mapear o discoveredContent original para um mapa para fácil acesso por ID
            const contentMap = new Map(discoveredContentRef.current.map(item => [item.id, item]));

            // Criar uma nova lista de discoveredContent reordenada e com descrições atualizadas
            const reorderedContent: ContentItem[] = [];
            organizedTrailData.organizedTrail.forEach(section => {
              section.items.forEach(organizedItem => {
                const originalItem = contentMap.get(organizedItem.id);
                if (originalItem) {
                  reorderedContent.push({
                    ...originalItem,
                    description: organizedItem.organizedDescription // Atualizar a descrição
                  });
                }
              });
            });

            setDiscoveredContent(reorderedContent); // Atualizar discoveredContent com a nova ordem e descrições
            discoveredContentRef.current = reorderedContent; // Atualizar ref imediatamente
            setOrganizedTrail(organizedTrailData); // Manter a estrutura organizada para exibição
            organizedTrailRef.current = organizedTrailData; // Atualizar ref

          } else {
            console.error(`${t('organize_step_api_not_ok')}`, response.status, response.statusText)
            // Fallback: if organization fails, use approved content as a single section
            const approvedContent = discoveredContentRef.current.filter((item) => item.isApproved)
            setOrganizedTrail({
              organizedTrail: [{ sectionTitle: t('recommended_content'), items: approvedContent.map(item => ({ id: item.id, organizedDescription: item.description || "" })) }],
            });
            organizedTrailRef.current = {
              organizedTrail: [{ sectionTitle: t('recommended_content'), items: approvedContent.map(item => ({ id: item.id, organizedDescription: item.description || "" })) }],
            };
          }
        } catch (error) {
          console.error(`${t('organize_step_error_organizing')}`, error)
          // Fallback: if organization fails, use approved content as a single section
          const approvedContent = discoveredContentRef.current.filter((item) => item.isApproved)
          const fallbackTrail = {
            organizedTrail: [{ sectionTitle: t('recommended_content'), items: approvedContent.map(item => ({ id: item.id, organizedDescription: item.description || "" })) }],
          };
          setOrganizedTrail(fallbackTrail);
          organizedTrailRef.current = fallbackTrail;
        }
      } else if (step.id === "finalize") {
        try {
          if (discoveredContentRef.current && discoveredContentRef.current.length > 0) {
            let finalOrganizedTrail = organizedTrailRef.current;
            if (!finalOrganizedTrail) {
              console.warn(`${t('finalize_step_organized_trail_not_set')}`);
              finalOrganizedTrail = { organizedTrail: [{ sectionTitle: t('complete_trail'), items: discoveredContentRef.current.map(item => ({ id: item.id, organizedDescription: item.description || "" })) }] };
            }

            console.log(`${t('finalize_step_user_logged_in_saving')}`)
            const payload = {
              title: `${t('personalized_learning_trail_about')} ${topic}`,
              topic,
              difficulty: "beginner",
              description: `${t('personalized_learning_trail_about')} ${topic}.`,
              organizedTrail: finalOrganizedTrail,
              content: discoveredContentRef.current, // Enviar o conteúdo completo
            }
            const response = await fetch("/api/learning-paths/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })

            if (response.ok) {
              const data = await response.json()
              console.log(`${t('finalize_step_learning_path_saved')}`, data.learningPath)
            } else {
              console.error(`${t('finalize_step_api_not_ok')}`, response.status, response.statusText)
              // Do not fallback to local storage, as per requirements
            }
          } else {
            console.warn(`${t('finalize_step_no_content_to_save')}`);
          }
        } catch (error) {
          console.error(`${t('finalize_step_error_finalizing')}`, error)
          // Do not fallback to local storage, as per requirements
        }
      }

      // Mark step as completed
      setSteps((prev) =>
        prev.map((s, i) => (i === stepIndex ? { ...s, status: "completed" as const } : s)),
      )

      console.log(`${t('completed_step')} ${stepIndex}: ${step.id}`)
      
      // Check if this is the last step to set completion
      if (stepIndex === steps.length - 1) {
        setIsComplete(true);
        audioService.playProcessingCompletedSound(); // Play sound on completion
        console.log(`${t('all_steps_completed')}`);
      }
    },
    [steps, topic, sources, answers, user, t],
  );

  const startProcessing = useCallback(async () => {
    if (hasStarted.current) return
    hasStarted.current = true

    console.log(`${t('starting_processing_sequence')}`)

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      await processStep(i)

      // Delay extra entre as etapas para garantir que os dados sejam processados
      if (i < steps.length - 1) { // Adicionar delay para todas as etapas, exceto a última
        console.log(`${t('waiting_extra_time_after_step')} ${steps[i].id}...`)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    console.log(`${t('processing_sequence_completed')}`)
  }, [processStep, steps.length, t])

  useEffect(() => {
    if (topic && sources.length > 0 && !hasStarted.current) {
      console.log(`${t('initializing_processing_with')}`, { topic, sources: sources.length, answers: answers.length })
      startProcessing()
    }
  }, [topic, sources, startProcessing, answers.length, t])

  const handleContinue = () => {
    router.push("/dashboard")
  }

  const handleCardClick = (item: ContentItem) => {
    setSelectedContent(item)
    setIsPopupOpen(true)
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
    setSelectedContent(null)
  }

  if (!topic || sources.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#FF6B35]" />
          <p className="text-[#718096]">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white">
      {/* Header */}
      <header className="px-6 py-6 border-b border-[#F1F5F9]/50 backdrop-blur-sm bg-white/80">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3748]">{t('creating_learning_path')}</h1>
              <p className="text-[#718096] mt-1">
                {t('organizing_best_content_about')} <strong>{topic}</strong>
              </p>
            </div>
            <div className="text-sm text-[#718096] bg-white px-3 py-1 rounded-full border border-[#E2E8F0]">
              {t('step_3_of_3')}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-[#F1F5F9] h-2">
        <motion.div
          className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] h-2"
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Processing Steps */}
          <div>
            <h2 className="text-xl font-bold text-[#2D3748] mb-8">{t('creation_progress')}</h2>
            <Stepper steps={steps} currentStep={currentStep} />

            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="font-bold text-green-800 text-lg">{t('trail_created_successfully')}</h3>
                </div>
                <p className="text-green-700 mb-4">
                  {t('your_personalized_trail_about')} <strong>{topic}</strong> {t('is_ready')}
                </p>
                <Button
                  onClick={handleContinue}
                  className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white px-6 py-3 rounded-full font-medium transition-colors duration-200"
                >
                  {t('continue_to_dashboard')}
                </Button>
              </motion.div>
            )}
          </div>

          {/* Content Preview */}
          <div>
            <h2 className="text-xl font-bold text-[#2D3748] mb-8">
              {organizedTrail ? t('your_learning_trail') : t('discovered_content')}
            </h2>
            {organizedTrail && organizedTrail.organizedTrail.length > 0 ? (
              organizedTrail.organizedTrail.map((section: TrailSection, sectionIndex: number) => (
                <div key={sectionIndex} className="mb-8">
                  <h3 className="text-lg font-semibold text-[#2D3748] mb-4">
                    {section.sectionTitle}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    <AnimatePresence>
                      {section.items.map((organizedItem) => {
                        // Encontrar o ContentItem completo correspondente no discoveredContent
                        const fullContentItem = discoveredContent.find(
                          (item) => item.id === organizedItem.id,
                        );
                        if (fullContentItem) {
                          return (
                            <motion.div
                              key={fullContentItem.id}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ContentCard item={fullContentItem} onClick={handleCardClick} />
                            </motion.div>
                          );
                        }
                        return null;
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <AnimatePresence>
                  {discoveredContent
                    .sort((a, b) => {
                      if (a.isApproved && !b.isApproved) return -1
                      if (!a.isApproved && b.isApproved) return 1
                      return 0
                    })
                    .map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: item.isApproved ? 1 : 0.3,
                          y: 0,
                        }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={item.isApproved ? "" : "grayscale pointer-events-none"}
                      >
                        <ContentCard item={item} onClick={handleCardClick} />
                      </motion.div>
                    ))}
                </AnimatePresence>
                {discoveredContent.length === 0 && currentStep >= 0 && (
                  <div className="text-center py-12 col-span-full flex flex-col items-center justify-center">
                    <Loader />
                    <p className="text-[#718096] mt-4">{t('searching_content_ellipsis')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <ContentDetailsPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        item={selectedContent}
      />
    </div>
  )
}