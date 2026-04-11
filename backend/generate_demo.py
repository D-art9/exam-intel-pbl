from fpdf import FPDF
import os

# Create folder
os.makedirs('demo_assets', exist_ok=True)

class DemoPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'EXAM INTEL - NEURAL SYNTHESIS DEMO', 0, 1, 'C')

def generate_handout():
    pdf = DemoPDF()
    pdf.add_page()
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 10, 'Neural Networks 101 - Master Syllabus', 0, 1, 'L')
    pdf.ln(10)
    
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, 'Lecture Plan', 0, 1, 'L')
    
    # Table Header
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(15, 10, 'Lec.', 1)
    pdf.cell(60, 10, 'Topics', 1)
    pdf.cell(70, 10, 'Session Outcome', 1)
    pdf.cell(30, 10, 'Corr. CO', 1)
    pdf.ln()
    
    # Table Rows
    data = [
        ['1', 'Intro to Perceptrons', 'Understand linear separation', 'CO1'],
        ['2', 'Backpropagation', 'Apply chain rule for weights', 'CO2'],
        ['3', 'ConvNets (CNNs)', 'Design image feature maps', 'CO3'],
        ['4', 'Recurrent Nets (RNNs)', 'Model temporal dependencies', 'CO4'],
    ]
    
    pdf.set_font('Arial', '', 10)
    for row in data:
        pdf.cell(15, 10, row[0], 1)
        pdf.cell(60, 10, row[1], 1)
        pdf.cell(70, 10, row[2], 1)
        pdf.cell(30, 10, row[3], 1)
        pdf.ln()
        
    pdf.ln(10)
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, 'Course Outcomes', 0, 1, 'L')
    
    co_data = [
        ['CO1', 'Explain the fundamental limits of Perceptrons.'],
        ['CO2', 'Implement weight updates via Gradient Descent.'],
        ['CO3', 'Architect sparse connectivity in CNNs.'],
    ]
    
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(20, 10, 'CO', 1)
    pdf.cell(160, 10, 'CO Statement', 1)
    pdf.ln()
    
    pdf.set_font('Arial', '', 10)
    for row in co_data:
        pdf.cell(20, 10, row[0], 1)
        pdf.cell(160, 10, row[1], 1)
        pdf.ln()
        
    pdf.output('demo_assets/demo_handout.pdf')

def generate_pyq(year):
    pdf = DemoPDF()
    pdf.add_page()
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 10, f'End Semester Examination - {year}', 0, 1, 'L')
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 10, 'Subject: Neural Networks (CS-304)', 0, 1, 'L')
    pdf.ln(10)
    
    if year == 2022:
        qs = [
            "Q1. Explain the X-OR problem and prove why a single-layer perceptron cannot solve it. [10 marks]",
            "Q2. Derive the backpropagation weight update rule using the chain rule. [15 marks]",
            "Q3. Briefly explain the vanishing gradient problem. [5 marks]"
        ]
    else:
        qs = [
            "Q1. Compare and contrast CNNs vs RNNs for sequence modeling. [10 marks]",
            "Q2. Describe the architecture of a 3x3 convolution filter and max-pooling. [10 marks]",
            "Q3. Write the mathematical expression for a ReLU activation. [5 marks]"
        ]
        
    pdf.set_font('Arial', '', 11)
    for q in qs:
        pdf.multi_cell(0, 10, q)
        pdf.ln(5)
        
    pdf.output(f'demo_assets/demo_pyq_{year}.pdf')

if __name__ == "__main__":
    print("Generating demo PDFs...")
    generate_handout()
    generate_pyq(2022)
    generate_pyq(2023)
    print("Done!")
