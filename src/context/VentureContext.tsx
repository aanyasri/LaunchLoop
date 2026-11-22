import React, { createContext, useContext, useState, useEffect } from 'react';
import { VentureState, PipelineStage } from '../types/pipeline';
import { BusinessProblem } from '../types/problem';
import { SimulationResult } from '../types/simulator';
import { PrebookingCampaign } from '../types/prebooking';

interface VentureContextType {
  venture: VentureState;
  setStage: (stage: PipelineStage) => void;
  selectProblem: (problem: BusinessProblem) => void;
  updateIdea: (idea: NonNullable<VentureState['idea']>) => void;
  setSimulationResult: (result: SimulationResult) => void;
  setPrebookingCampaign: (campaign: PrebookingCampaign) => void;
  resetVenture: () => void;
}

const STORAGE_KEY = 'launchloop_active_venture';

const DEFAULT_VENTURE: VentureState = {
  currentStage: 1,
  selectedProblem: null,
  idea: null,
  simulationResult: null,
  prebookingCampaign: null,
};

const VentureContext = createContext<VentureContextType | undefined>(undefined);

export const VentureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [venture, setVenture] = useState<VentureState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return DEFAULT_VENTURE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(venture));
    } catch {
      // ignore
    }
  }, [venture]);

  const setStage = (stage: PipelineStage) => {
    setVenture((prev) => ({ ...prev, currentStage: stage }));
  };

  const selectProblem = (problem: BusinessProblem) => {
    setVenture((prev) => {
      // Automatically prefill missing roles and seed idea from problem
      const missingRoles = problem.suggestedRoles || [
        'Tech Lead / Fullstack',
        'Growth & Marketing',
      ];
      return {
        ...prev,
        selectedProblem: problem,
        currentStage: Math.max(prev.currentStage, 2) as PipelineStage,
        idea: prev.idea || {
          productName: `Solution for ${problem.title.substring(0, 24)}`,
          targetProblem: problem.summary,
          description: problem.desiredOutcome,
          targetAudience: `Indian businesses in ${problem.industry}`,
          priceINR: 1999,
          filledRoles: ['Operations & Logistics'],
          missingRoles,
        },
      };
    });
  };

  const updateIdea = (idea: NonNullable<VentureState['idea']>) => {
    setVenture((prev) => ({
      ...prev,
      idea,
      currentStage: Math.max(prev.currentStage, 2) as PipelineStage,
    }));
  };

  const setSimulationResult = (result: SimulationResult) => {
    setVenture((prev) => ({
      ...prev,
      simulationResult: result,
      currentStage: Math.max(prev.currentStage, 4) as PipelineStage, // moves pipeline forward to prebook
    }));
  };

  const setPrebookingCampaign = (campaign: PrebookingCampaign) => {
    setVenture((prev) => ({
      ...prev,
      prebookingCampaign: campaign,
    }));
  };

  const resetVenture = () => {
    setVenture(DEFAULT_VENTURE);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <VentureContext.Provider
      value={{
        venture,
        setStage,
        selectProblem,
        updateIdea,
        setSimulationResult,
        setPrebookingCampaign,
        resetVenture,
      }}
    >
      {children}
    </VentureContext.Provider>
  );
};

export const useVenture = (): VentureContextType => {
  const context = useContext(VentureContext);
  if (!context) {
    throw new Error('useVenture must be used within a VentureProvider');
  }
  return context;
};
