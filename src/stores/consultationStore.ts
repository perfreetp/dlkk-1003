import { create } from 'zustand'
import type { Consultation, ConsultationMessage, UserRole } from '@/types'
import { consultations } from '@/mock'

interface ConsultationState {
  consultations: Consultation[]
  activeConsultationId: string | null
  messages: ConsultationMessage[]
  sendMessage: (senderId: string, senderName: string, content: string, type: 'text' | 'image' | 'keyImage') => void
  createConsultation: (studyId: string, title: string, createdBy: string, participants: { id: string; name: string; role: UserRole }[]) => void
  endConsultation: (consultationId: string) => void
  addKeyImage: (consultationId: string, imageId: string, description: string, addedBy: string) => void
}

const allMessages: ConsultationMessage[] = consultations.flatMap(
  (c) => c.messages || []
)

export const useConsultationStore = create<ConsultationState>((set, get) => ({
  consultations,
  activeConsultationId: consultations[0]?.id || null,
  messages: allMessages,
  sendMessage: (senderId: string, senderName: string, content: string, type: 'text' | 'image' | 'keyImage') => {
    const { activeConsultationId } = get()
    if (!activeConsultationId) return
    const message: ConsultationMessage = {
      id: `msg-${Date.now()}`,
      consultationId: activeConsultationId,
      senderId,
      senderName,
      userId: senderId,
      userName: senderName,
      content,
      type,
      createdAt: new Date().toISOString(),
      sendTime: new Date().toISOString(),
    }
    set((state) => ({
      messages: [...state.messages, message],
      consultations: state.consultations.map((c) =>
        c.id === activeConsultationId
          ? { ...c, messages: [...(c.messages || []), message] }
          : c
      ),
    }))
  },
  createConsultation: (studyId: string, title: string, createdBy: string, participants: { id: string; name: string; role: UserRole }[]) => {
    const consultation: Consultation = {
      id: `consult-${Date.now()}`,
      studyId,
      title,
      status: 'active',
      participants,
      keyImages: [],
      createdBy,
      createdAt: new Date().toISOString(),
      messages: [],
    }
    set((state) => ({
      consultations: [...state.consultations, consultation],
      activeConsultationId: consultation.id,
    }))
  },
  endConsultation: (consultationId: string) => {
    set((state) => ({
      consultations: state.consultations.map((c) =>
        c.id === consultationId
          ? { ...c, status: 'ended' as const, endedAt: new Date().toISOString() }
          : c
      ),
    }))
  },
  addKeyImage: (consultationId: string, imageId: string, description: string, addedBy: string) => {
    set((state) => ({
      consultations: state.consultations.map((c) =>
        c.id === consultationId
          ? {
              ...c,
              keyImages: [
                ...c.keyImages,
                {
                  id: `ki-${Date.now()}`,
                  imageId,
                  description,
                  addedBy,
                  addedAt: new Date().toISOString(),
                },
              ],
            }
          : c
      ),
    }))
  },
}))
