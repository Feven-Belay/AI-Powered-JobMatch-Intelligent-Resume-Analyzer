# backend/parse_resume.py
import sys
import json
from pyresparser import ResumeParser
import re
from pdfminer.high_level import extract_text
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
import textstat
import datetime
import joblib
from PyPDF2 import PdfReader
import spacy
from dateutil import parser
import openai


import nltk
from nltk.corpus import stopwords
import sys

try:
    # Attempt to load stopwords to ensure they're available
    stop_words = stopwords.words('english')
except LookupError:
    # Handle the error if stopwords aren't available
    print("NLTK stopwords not found. Downloading now...")
    nltk.download('stopwords')
    stop_words = stopwords.words('english')  # Try again after downloading
except Exception as e:
    print(f"An unexpected error occurred: {str(e)}", file=sys.stderr)
    sys.exit(1)


def extract_college_name(text):
    patterns = [
        r'\b[a-zA-Z ]+ University\b',
        r'\bUniversity of [a-zA-Z ]+\b',
        r'\bCollege of [a-zA-Z ]+\b',
        r'\bInstitute of [a-zA-Z ]+\b'
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0)
    return None

def extract_degree(text):
    patterns = [
        r"\b(Bachelor's|Master's|PhD|B\.Sc\.|M\.Sc\.|BBA|MBA)\b(?:\s+in\s+[A-Za-z\s]+)?",
        r"\b(B\.?S\.?|M\.?S\.)\s*(?:in\s+[A-Za-z\s]+)?",
        r"\b(PhD|Doctor of Philosophy)\b(?:\s+in\s+[A-Za-z\s]+)?"
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0)
    return None

def calculate_similarity(resume_text, job_desc_text):
    stop_words = list(stopwords.words('english'))
    vectorizer = TfidfVectorizer(stop_words=stop_words)
    documents = [resume_text, job_desc_text]
    tfidf_matrix = vectorizer.fit_transform(documents)
    similarity_percentage = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0] * 100
    return f"{similarity_percentage:.2f}%"

def extract_phone_number(resume_text):
    phone_patterns = [
        r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b',
        r'\(\d{3}\)\s*\d{3}[-.\s]?\d{4}'
    ]
    for pattern in phone_patterns:
        match = re.search(pattern, resume_text)
        if match:
            return match.group(0)
    return "N/A"

def extract_dates(text):
    pattern = r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)[a-z]*\.? \d{4} – (?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)[a-z]*\.? \d{4}|Present)"
    matches = re.findall(pattern, text, re.IGNORECASE)
    structured_dates = []
    for match in matches:
        try:
            start, end = match.split(' – ')
            start_date = datetime.datetime.strptime(start.strip(), "%B %Y")
            end_date = datetime.datetime.now() if end.lower().strip() == "present" else datetime.datetime.strptime(end.strip(), "%B %Y")
            structured_dates.append((start_date, end_date))
        except ValueError as e:
            print(f"Error parsing dates from '{match}': {e}", file=sys.stderr)
    return structured_dates

def calculate_total_experience(dates):
    total_years = 0
    for start_date, end_date in dates:
        total_years += (end_date.year - start_date.year) + ((end_date.month - start_date.month) / 12)
    return total_years


def analyze_skills(resume_skills, job_skills):
    missing_skills = list(set(job_skills) - set(resume_skills))
    recommended_skills = [skill for skill in job_skills if skill not in resume_skills]
    return missing_skills, recommended_skills

def evaluate_layout_and_structure(text):
    sections = ['Experience', 'Education', 'Skills', 'Certifications']
    missing_sections = [section for section in sections if section.lower() not in text.lower()]
    feedback = []
    if missing_sections:
        feedback.append(f"Consider including these missing sections for better structure: {', '.join(missing_sections)}.")
    return feedback

def evaluate_readability(text):
    score = textstat.flesch_reading_ease(text)
    feedback = f"Readability score is {score}. "
    if score < 60:
        feedback += "Text is fairly complex; consider simplifying sentences."
    elif score < 30:
        feedback += "Text is very difficult to read; strongly consider simplifying language."
    else:
        feedback += "Text is reasonably easy to read."
    return feedback

def get_pdf_page_count(file_path):
    with open(file_path, 'rb') as f:
        pdf = PdfReader(f)
        return len(pdf.pages)

def predict_field_with_model(resume_text, model):
    predicted_field = model.predict([resume_text])[0]
    return predicted_field

def determine_user_level(total_experience):
    if total_experience < 2:
        return "Entry"
    elif 2 <= total_experience < 5:
        return "Intermediate"
    else:
        return "Experienced"


def extract_relevant_experiences_gpt3(resume_text, job_desc):
    prompt = f"""
    Given the following job description, extract and list only the relevant experiences from the resume that match or align closely with the job requirements. GIVE ME THE OUTPUT IN LIST FORM POINT BY POINT :

    Job Description:
    "{job_desc}"

    Resume Text:
    "{resume_text}"

    Relevant Experiences:
    """

    response = openai.ChatCompletion.create(
        # model="gpt-4",
        model= "gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert in matching job experiences from resumes with job descriptions."},
            {"role": "user", "content": prompt},
        ],
        max_tokens=300,
        temperature=0,
    )

    experiences_text = response.choices[0].message['content'].strip()

    return experiences_text


def recommend_skills(resume_text, job_desc):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an AI trained to suggest job-relevant skills based on resume and job descriptions.Give me just the skills without explanation in bullet points"},
                {"role": "user", "content": f"Analyze this resume and the job description to suggest skills.\n\nResume: {resume_text}\n\nJob Description: {job_desc} in bullet points"}
            ]
        )
        # Parse the response
        skills_text = response['choices'][0]['message']['content'].strip()
        return skills_text
    except Exception as e:
        return str(e)


def extract_skills_gpt3(resume_text, job_desc):
    prompt = f"""
    Extract the relevant skills from the following resume text and align them with the job description provided. Only list the skills and separate them by commas:

    Job Description:
    "{job_desc}"

    Resume Text:
    "{resume_text}"

    Skills:
    """

    response = openai.ChatCompletion.create(
        # model="gpt-4",
        model= "gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert in extracting key skills from resumes."},
            {"role": "user", "content": prompt},
        ],
        max_tokens=300,
        temperature=0,
    )

    skills_text = response.choices[0].message['content'].strip()

    return skills_text



def generate_layout_feedback(resume_text):
    prompt = f"""
    You are an expert in resume analysis. Please provide detailed feedback on the layout and structure of the following resume:

    Resume:
    {resume_text}

    Feedback on Layout and Structure:
    """

    response = openai.ChatCompletion.create(
        # model="gpt-4",
        model= "gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert in resume analysis."},
            {"role": "user", "content": prompt},
        ],
        max_tokens= 300,
        temperature=0.7,
    )

    feedback = response.choices[0].message['content'].strip()
    return feedback
def generate_ai_insights(resume_text, job_desc):
    prompt = f"""
    Based on the following resume and job description, provide insights on how well the resume aligns with the job description. Highlight strengths and areas for improvement.

    Resume:
    {resume_text}

    Job Description:
    {job_desc}

    AI Insights:
    """

    response = openai.ChatCompletion.create(
        # model="gpt-4",
        model= "gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert in job matching."},
            {"role": "user", "content": prompt},
        ],
        max_tokens=300,
        temperature=0.7,
    )

    insights = response.choices[0].message['content'].strip()
    return insights


def generate_gpt_feedback(resume_text, job_desc):
    prompt = f"""
    You are an expert in job matching. Based on the following resume and job description, provide detailed feedback that could help improve the candidate's chances of getting the job.

    Resume:
    {resume_text}

    Job Description:
    {job_desc}

    GPT Feedback:
    """

    response = openai.ChatCompletion.create(
        # model="gpt-4",
        model= "gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert in providing feedback for job applications."},
            {"role": "user", "content": prompt},
        ],
        max_tokens=300,
        temperature=0.7,
    )

    feedback = response.choices[0].message['content'].strip()
    return feedback

def predict_field(resume_text):
    prompt = f"""
    Based on the following resume, predict the most likely professional field or industry the candidate is suited for.

    Resume:
    {resume_text}

    Predicted Field:
    """

    response = openai.ChatCompletion.create(
        # model="gpt-4",
        model= "gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert in career advising."},
            {"role": "user", "content": prompt},
        ],
        max_tokens=300,
        temperature=0.7,
    )

    predicted_field = response.choices[0].message['content'].strip()
    return predicted_field



import json

def generate_cover_letter(resume_text, job_desc):
    prompt = f"""
    Write a professional cover letter for a candidate applying for a job based on the following resume and job description. Include a greeting, introduction, why they are a good fit for the role, and a closing statement. Use a formal and respectful tone. USE THE USER INFORMATION AND HIRING MANAGER INFORMATION TO WRITE THE ADDRESS.

    Resume Information:
    {resume_text}

    Job Description:
    {job_desc}
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.5,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        
        # Extract the generated cover letter from the response
        cover_letter = response['choices'][0]['message']['content'].strip()
        return cover_letter

    except Exception as e:
        # Handle any exceptions and return an error message
        error_message = f"Error generating cover letter: {str(e)}"
        return error_message

def generate_updated_resume(resume_text, job_desc, recommended_skills):
    prompt = f"""
    Given the resume text and the job description, update the resume to better fit the job description by including the recommended skills, emphasizing relevant experiences, and improving the structure.

    Resume Text:
    "{resume_text}"

    Job Description:
    "{job_desc}"

    Recommended Skills:
    "{recommended_skills}"

    Updated Resume:
    """

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a professional resume editor."},
            {"role": "user", "content": prompt},
        ],
        max_tokens=1000,
        temperature=0.5,
    )

    updated_resume = response.choices[0].message['content'].strip()
    return updated_resume

def predict_field(resume_text):
    prompt = f"""
    Based on the following resume, predict the most likely professional field or industry the candidate is suited for.

    Resume:
    {resume_text}

    Predicted Field:
    """

    response = openai.ChatCompletion.create(
        # model="gpt-4",
        model= "gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert in career advising."},
            {"role": "user", "content": prompt},
        ],
        max_tokens=300,
        temperature=0.7,
    )

    predicted_field = response.choices[0].message['content'].strip()
    return predicted_field





def main(file_path, job_desc):
    try:
        resume_text = extract_text(file_path)
        resume_data = ResumeParser(file_path).get_extracted_data()
        college_name = extract_college_name(resume_text)
        degree = extract_degree(resume_text)
        similarity_score = calculate_similarity(resume_text, job_desc)
        job_skills = extract_skills_gpt3(resume_text, job_desc)
        resume_skills = extract_skills_gpt3(resume_text, job_desc)
        relevant_skills = extract_skills_gpt3(resume_text, job_desc)
        relevant_experiences = extract_relevant_experiences_gpt3(resume_text, job_desc)
        missing_skills = analyze_skills(resume_skills.split(','), job_skills)
        
        recommended_skills = recommend_skills(resume_text, job_desc)
        
        
        phone_number = extract_phone_number(resume_text)
        dates = extract_dates(resume_text)
        total_experience = calculate_total_experience(dates)
        readability_feedback = evaluate_readability(resume_text)       
        
        # Generate feedback using OpenAI
        layout_feedback = generate_layout_feedback(resume_text)
        ai_insights = generate_ai_insights(resume_text, job_desc)
        gpt_feedback = generate_gpt_feedback(resume_text, job_desc)
        predicted_field = predict_field(resume_text)
        
        
        
        
        
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        num_pages = get_pdf_page_count(file_path)
        model = joblib.load('field_prediction_model.pkl')
        predicted_field = predict_field_with_model(resume_text, model)
        
        
        
        
        cover_letter = generate_cover_letter(resume_text, job_desc)
        

        updated_resume = generate_updated_resume(resume_text, job_desc, recommended_skills)
        
        

        output_data = {
            "name": resume_data.get('name', 'N/A'),
            "email": resume_data.get('email', 'N/A'),
            "college_name": college_name,
            "degree": degree,
            "similarity_score": similarity_score,
            "skills": resume_skills,
            "relevant_skills": relevant_skills,
            "missing_skills": missing_skills,
            "relevant_experiences": relevant_experiences,
            "recommended_skills":recommended_skills,

            "layout_feedback": layout_feedback,
            "ai_insights": ai_insights,
            "gpt_feedback": gpt_feedback,
            "predicted_field": predicted_field,
            
            "phone_number": phone_number,
            "user_level": determine_user_level(total_experience),
            "timestamp": timestamp,
            "number_of_pages": num_pages,
            "total_experience": f"{total_experience:.2f} years",
            "predicted_field": predicted_field,
            
            
            "cover_letter": cover_letter if cover_letter else "N/A",
              "updated_resume": updated_resume,
        }

        print(json.dumps(output_data, indent=4))
    except Exception as e:
        error_message = f"Error: {str(e)}"
        print(json.dumps({"error": error_message}, indent=4), file=sys.stderr)


if __name__ == "__main__":
    # Assuming you pass the file path and job description as command-line arguments
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Please provide the file path and job description as arguments"}, indent=4), file=sys.stderr)
    else:
        main(sys.argv[1], sys.argv[2])
