import React from 'react';

interface WireInstructionsProps {
  wireInstructions: Invoice['wireInstructions'];
  onChange: (field: string, value: string) => void;
}

export const WireInstructions: React.FC<WireInstructionsProps> = ({
  wireInstructions,
  onChange,
}) => {
  // Combine all wire instructions into a single string
  const combinedInstructions = `Bank Name: ${wireInstructions.bankName || ''}
Account Name: ${wireInstructions.accountName || ''}
Account Number: ${wireInstructions.accountNumber || ''}
Routing Number: ${wireInstructions.routingNumber || ''}
SWIFT Code: ${wireInstructions.swiftCode || ''}
IBAN: ${wireInstructions.iban || ''}
${wireInstructions.additionalInfo ? `\nAdditional Information:\n${wireInstructions.additionalInfo}` : ''}`.trim();

  const handleChange = (value: string) => {
    // Parse the text area content to update the wire instructions object
    const instructions: Record<string, string> = {};
    const lines = value.split('\n');
    
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, val] = line.split(':').map(s => s.trim());
        switch (key.toLowerCase()) {
          case 'bank name':
            instructions.bankName = val;
            break;
          case 'account name':
            instructions.accountName = val;
            break;
          case 'account number':
            instructions.accountNumber = val;
            break;
          case 'routing number':
            instructions.routingNumber = val;
            break;
          case 'swift code':
            instructions.swiftCode = val;
            break;
          case 'iban':
            instructions.iban = val;
            break;
          default:
            if (!instructions.additionalInfo) {
              instructions.additionalInfo = line;
            } else {
              instructions.additionalInfo += '\n' + line;
            }
        }
      } else if (line.trim()) {
        if (!instructions.additionalInfo) {
          instructions.additionalInfo = line;
        } else {
          instructions.additionalInfo += '\n' + line;
        }
      }
    });

    // Update all wire instructions at once
    onChange('wireInstructions', instructions);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Wire Instructions</h3>
      <div>
        <textarea
          value={combinedInstructions}
          onChange={(e) => handleChange(e.target.value)}
          rows={10}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter wire transfer instructions..."
        />
        <p className="mt-2 text-sm text-gray-500">
          Enter your wire transfer instructions in a free format. Include details like Bank Name, Account Name, Account Number, Routing Number, SWIFT Code, and IBAN.
        </p>
      </div>
    </div>
  );
};