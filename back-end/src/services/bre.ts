export interface EligibilityCheck {
  passed: boolean;
  errors: string[];
}

// PAN Card format: ABCPK1234F (5 letters, 4 digits, 1 letter)
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export function checkEligibility(data: {
  fullName: string;
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: string;
}): EligibilityCheck {
  const errors: string[] = [];

  // Age check (between 23 and 50)
  const today = new Date();
  const birthDate = new Date(data.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  if (age < 23 || age > 50) {
    errors.push(`Age must be between 23 and 50 years. Current age: ${age}`);
  }

  // Salary check
  if (data.monthlySalary < 25000) {
    errors.push(
      `Monthly salary must be at least ₹25,000. Current salary: ₹${data.monthlySalary}`,
    );
  }

  // PAN format check
  if (!panRegex.test(data.pan)) {
    errors.push(
      "Invalid PAN card format. Format should be: ABCPK1234F (5 letters, 4 digits, 1 letter)",
    );
  }

  // Employment mode check
  if (data.employmentMode === "Unemployed") {
    errors.push("Unemployed applicants are not eligible for loans");
  }

  return {
    passed: errors.length === 0,
    errors,
  };
}
