import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { SimulationFormData, SimulationValidationErrors, SimulationInput } from '../../types/simulation';
import { 
  formDataToSimulationInput, 
  validateSimulationForm, 
  isFormValid,
  DEFAULT_SIMULATION_INPUT 
} from '../../utils/simulationUtils';

interface RevenueSimulatorFormProps {
  onSimulationChange: (inputs: SimulationInput) => void;
  onSaveSimulation: (inputs: SimulationInput) => void;
  initialData?: SimulationFormData;
  isLoading?: boolean;
}

export const RevenueSimulatorForm: React.FC<RevenueSimulatorFormProps> = ({
  onSimulationChange,
  onSaveSimulation,
  initialData,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<SimulationFormData>(
    initialData || {
      quantity: '',
      pricePerKg: '',
      transportCosts: '',
      otherCosts: '',
    }
  );
  const [errors, setErrors] = useState<SimulationValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  // Validate form whenever form data changes
  useEffect(() => {
    const validationErrors = validateSimulationForm(formData);
    setErrors(validationErrors);
    setIsValid(isFormValid(formData));

    // Notify parent component of changes
    if (isFormValid(formData)) {
      const inputs = formDataToSimulationInput(formData);
      onSimulationChange(inputs);
    }
  }, [formData, onSimulationChange]);

  const handleInputChange = (field: keyof SimulationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (isValid) {
      const inputs = formDataToSimulationInput(formData);
      onSaveSimulation(inputs);
    }
  };

  const handleReset = () => {
    setFormData({
      quantity: '',
      pricePerKg: '',
      transportCosts: '',
      otherCosts: '',
    });
    setErrors({});
  };

  const handleFillSampleData = () => {
    setFormData({
      quantity: '1000',
      pricePerKg: '850',
      transportCosts: '50000',
      otherCosts: '25000',
    });
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('simulation.form.title', 'Simulador de Receitas')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {t('simulation.form.description', 'Insira os dados para calcular seus receitas potenciais')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
        {/* Quantidade */}
        <Input
          label={t('simulation.form.quantity', 'Quantidade (kg)')}
          type="number"
          value={formData.quantity}
          onChange={(e) => handleInputChange('quantity', e.target.value)}
          error={errors.quantity}
          placeholder="0"
          min="0"
          step="0.1"
          helpText={t('simulation.form.quantityHelp', 'Quantidade de cajou em quilogramas')}
        />

        {/* Preço por kg */}
        <Input
          label={t('simulation.form.pricePerKg', 'Preço por kg (FCFA)')}
          type="number"
          value={formData.pricePerKg}
          onChange={(e) => handleInputChange('pricePerKg', e.target.value)}
          error={errors.pricePerKg}
          placeholder="0"
          min="0"
          step="0.01"
          helpText={t('simulation.form.pricePerKgHelp', 'Preço atual do mercado por quilograma')}
        />

        {/* Custos de transporte */}
        <Input
          label={t('simulation.form.transportCosts', 'Custos de Transporte (FCFA)')}
          type="number"
          value={formData.transportCosts}
          onChange={(e) => handleInputChange('transportCosts', e.target.value)}
          error={errors.transportCosts}
          placeholder="0"
          min="0"
          step="0.01"
          helpText={t('simulation.form.transportCostsHelp', 'Custos de transporte para levar o cajou ao mercado')}
        />

        {/* Outros custos */}
        <Input
          label={t('simulation.form.otherCosts', 'Outros Custos (FCFA)')}
          type="number"
          value={formData.otherCosts}
          onChange={(e) => handleInputChange('otherCosts', e.target.value)}
          error={errors.otherCosts}
          placeholder="0"
          min="0"
          step="0.01"
          helpText={t('simulation.form.otherCostsHelp', 'Sacos, mão de obra, embalagem, etc.')}
        />
      </div>

      {/* Action buttons - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          onClick={handleSave}
          disabled={!isValid || isLoading}
          loading={isLoading}
          className="flex-1 order-1"
        >
          {t('simulation.form.save', 'Salvar Simulação')}
        </Button>
        
        <div className="flex gap-2 sm:gap-3 order-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            {t('simulation.form.reset', 'Limpar')}
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleFillSampleData}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            {t('simulation.form.sampleData', 'Exemplo')}
          </Button>
        </div>
      </div>

      {/* Form validation summary */}
      {!isValid && Object.keys(errors).length > 0 && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
            {t('simulation.form.validationErrors', 'Por favor, corrija os seguintes erros:')}
          </p>
          <ul className="text-sm text-red-600 dark:text-red-400 list-disc list-inside">
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

