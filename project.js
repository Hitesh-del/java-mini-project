
        // Base Question Class
        class Question {
            constructor(text, id) {
                if (!text) {
                    throw new Error("Question text cannot be empty");
                }
                this.text = text;
                this.id = id;
                this.userAnswer = null;
                this.timeSpent = 0;
                this.startTime = null;
            }

            render() {
                throw new Error("render method must be implemented by subclass");
            }

            validateAnswer() {
                throw new Error("validateAnswer method must be implemented by subclass");
            }

            isCorrect() {
                throw new Error("isCorrect method must be implemented by subclass");
            }

            setUserAnswer(answer) {
                this.userAnswer = answer;
            }

            isAnswered() {
                return this.userAnswer !== null;
            }

            startTimer() {
                this.startTime = new Date();
            }

            stopTimer() {
                if (this.startTime) {
                    this.timeSpent = new Date() - this.startTime;
                    this.startTime = null;
                }
            }
        }

        // MCQ Question Class
        class MCQQuestion extends Question {
            constructor(text, options, correctAnswer, id) {
                super(text, id);
                
                if (!options || options.length < 2) {
                    throw new Error("MCQ must have at least 2 options");
                }
                
                if (correctAnswer < 0 || correctAnswer >= options.length) {
                    throw new Error("Correct answer index is out of range");
                }
                
                this.options = options;
                this.correctAnswer = correctAnswer;
            }

            render() {
                let html = `
                    <div class="question-container">
                        <div class="question-number"><i class="fas fa-question-circle"></i> Question ${this.id}</div>
                        <div class="question-text">${this.text}</div>
                        <div class="options">
                `;
                
                this.options.forEach((option, index) => {
                    const checked = this.userAnswer === index ? 'checked' : '';
                    html += `
                        <div class="option">
                            <input type="radio" id="q${this.id}_option${index}" name="q${this.id}" value="${index}" ${checked}>
                            <label for="q${this.id}_option${index}">${option}</label>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
                
                return html;
            }

            validateAnswer() {
                if (this.userAnswer === null) {
                    throw new Error(`Question ${this.id} is not answered`);
                }
                return true;
            }

            isCorrect() {
                return this.userAnswer === this.correctAnswer;
            }
        }

        // True/False Question Class
        class TrueFalseQuestion extends Question {
            constructor(text, correctAnswer, id) {
                super(text, id);
                
                if (typeof correctAnswer !== 'boolean') {
                    throw new Error("Correct answer for True/False must be a boolean");
                }
                
                this.correctAnswer = correctAnswer;
            }

            render() {
                const trueChecked = this.userAnswer === true ? 'checked' : '';
                const falseChecked = this.userAnswer === false ? 'checked' : '';
                
                return `
                    <div class="question-container">
                        <div class="question-number"><i class="fas fa-toggle-on"></i> Question ${this.id}</div>
                        <div class="question-text">${this.text}</div>
                        <div class="options">
                            <div class="option">
                                <input type="radio" id="q${this.id}_true" name="q${this.id}" value="true" ${trueChecked}>
                                <label for="q${this.id}_true"><i class="fas fa-check"></i> True</label>
                            </div>
                            <div class="option">
                                <input type="radio" id="q${this.id}_false" name="q${this.id}" value="false" ${falseChecked}>
                                <label for="q${this.id}_false"><i class="fas fa-times"></i> False</label>
                            </div>
                        </div>
                    </div>
                `;
            }

            validateAnswer() {
                if (this.userAnswer === null) {
                    throw new Error(`Question ${this.id} is not answered`);
                }
                return true;
            }

            isCorrect() {
                return this.userAnswer === this.correctAnswer;
            }
        }

        // Exam Management System
        class ExamSystem {
            constructor() {
                this.questions = [];
                this.currentQuestionIndex = 0;
                this.examStartTime = null;
                this.examEndTime = null;
                this.timeLimit = 15 * 60; // 15 minutes in seconds
                this.timerInterval = null;
                this.studentName = '';
                this.studentId = '';
                
                this.initializeQuestions();
                this.setupEventListeners();
            }

            initializeQuestions() {
                try {
                    // MCQ Questions
                    this.questions.push(new MCQQuestion(
                        "Which of the following is NOT a programming language?",
                        ["Python", "HTML", "Java", "C++"],
                        1,
                        1
                    ));
                    
                    this.questions.push(new MCQQuestion(
                        "What does 'OOP' stand for in programming?",
                        ["Object-Oriented Programming", "Online Operations Protocol", "Optimized Output Processing", "Open Operating Platform"],
                        0,
                        2
                    ));
                    
                    this.questions.push(new MCQQuestion(
                        "Which data structure uses LIFO (Last In, First Out) principle?",
                        ["Queue", "Stack", "Array", "Tree"],
                        1,
                        3
                    ));
                    
                    this.questions.push(new MCQQuestion(
                        "In JavaScript, which method is used to add an element to the end of an array?",
                        ["push()", "pop()", "shift()", "unshift()"],
                        0,
                        4
                    ));
                    
                    this.questions.push(new MCQQuestion(
                        "What is the time complexity of binary search algorithm?",
                        ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
                        1,
                        5
                    ));
                    
                    this.questions.push(new MCQQuestion(
                        "Which of the following is a valid SQL command to retrieve data from a database?",
                        ["GET", "FETCH", "SELECT", "RETRIEVE"],
                        2,
                        6
                    ));
                    
                    // True/False Questions
                    this.questions.push(new TrueFalseQuestion(
                        "Git is a centralized version control system.",
                        false,
                        7
                    ));
                    
                    this.questions.push(new TrueFalseQuestion(
                        "In Python, indentation is used to define code blocks.",
                        true,
                        8
                    ));
                    
                    this.questions.push(new TrueFalseQuestion(
                        "API stands for Application Programming Interface.",
                        true,
                        9
                    ));
                    
                    this.questions.push(new TrueFalseQuestion(
                        "Machine learning is a subset of artificial intelligence.",
                        true,
                        10
                    ));
                } catch (error) {
                    this.showNotification(error.message, 'error');
                }
            }

            setupEventListeners() {
                // Welcome screen
                document.getElementById('startExamBtn').addEventListener('click', () => this.startExam());
                
                // Exam screen
                document.getElementById('prevBtn').addEventListener('click', () => this.previousQuestion());
                document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
                document.getElementById('submitBtn').addEventListener('click', () => this.submitExam());
                
                // Result screen
                document.getElementById('retakeBtn').addEventListener('click', () => this.resetExam());
            }

            startExam() {
                try {
                    // Validate student information
                    const nameInput = document.getElementById('studentName');
                    const idInput = document.getElementById('studentId');
                    
                    if (!nameInput.value.trim()) {
                        document.getElementById('nameError').style.display = 'block';
                        throw new Error("Please enter your name");
                    }
                    
                    if (!idInput.value.trim()) {
                        document.getElementById('idError').style.display = 'block';
                        throw new Error("Please enter your student ID");
                    }
                    
                    this.studentName = nameInput.value.trim();
                    this.studentId = idInput.value.trim();
                    
                    // Hide welcome screen and show exam screen
                    document.getElementById('welcomeScreen').classList.add('hidden');
                    document.getElementById('examScreen').classList.remove('hidden');
                    
                    // Start timer
                    this.examStartTime = new Date();
                    this.startTimer();
                    
                    // Display first question
                    this.displayQuestion(0);
                    this.updateNavigationButtons();
                    
                    this.showNotification("Exam started. Good luck!", 'success');
                } catch (error) {
                    this.showNotification(error.message, 'error');
                }
            }

            startTimer() {
                let timeRemaining = this.timeLimit;
                
                this.timerInterval = setInterval(() => {
                    timeRemaining--;
                    
                    const minutes = Math.floor(timeRemaining / 60);
                    const seconds = timeRemaining % 60;
                    
                    document.getElementById('timeDisplay').textContent = 
                        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    
                    if (timeRemaining <= 60) {
                        document.getElementById('timeDisplay').style.color = '#f5365c';
                    }
                    
                    if (timeRemaining <= 0) {
                        clearInterval(this.timerInterval);
                        this.submitExam();
                    }
                }, 1000);
            }

            displayQuestion(index) {
                try {
                    if (index < 0 || index >= this.questions.length) {
                        throw new Error("Invalid question index");
                    }
                    
                    // Stop timer for current question
                    if (this.currentQuestionIndex >= 0 && this.currentQuestionIndex < this.questions.length) {
                        this.questions[this.currentQuestionIndex].stopTimer();
                    }
                    
                    this.currentQuestionIndex = index;
                    const question = this.questions[index];
                    
                    // Save current answer before changing question
                    this.saveCurrentAnswer();
                    
                    // Start timer for new question
                    question.startTimer();
                    
                    // Render question
                    document.getElementById('questionContainer').innerHTML = question.render();
                    
                    // Update progress bar
                    const progress = ((index + 1) / this.questions.length) * 100;
                    document.getElementById('progressBar').style.width = `${progress}%`;
                    document.getElementById('progressText').textContent = `${Math.round(progress)}%`;
                    
                    // Update navigation buttons
                    this.updateNavigationButtons();
                    
                    // Update question navigation
                    this.updateQuestionNavigation();
                    
                    // Add event listeners to options
                    const options = document.querySelectorAll(`input[name="q${question.id}"]`);
                    options.forEach(option => {
                        option.addEventListener('change', () => {
                            if (option.value === 'true') {
                                question.setUserAnswer(true);
                            } else if (option.value === 'false') {
                                question.setUserAnswer(false);
                            } else {
                                question.setUserAnswer(parseInt(option.value));
                            }
                            
                            // Update navigation to show answered question
                            this.updateQuestionNavigation();
                        });
                    });
                } catch (error) {
                    this.showNotification(error.message, 'error');
                }
            }

            saveCurrentAnswer() {
                const question = this.questions[this.currentQuestionIndex];
                const selectedOption = document.querySelector(`input[name="q${question.id}"]:checked`);
                
                if (selectedOption) {
                    if (selectedOption.value === 'true') {
                        question.setUserAnswer(true);
                    } else if (selectedOption.value === 'false') {
                        question.setUserAnswer(false);
                    } else {
                        question.setUserAnswer(parseInt(selectedOption.value));
                    }
                }
            }

            previousQuestion() {
                if (this.currentQuestionIndex > 0) {
                    this.displayQuestion(this.currentQuestionIndex - 1);
                }
            }

            nextQuestion() {
                if (this.currentQuestionIndex < this.questions.length - 1) {
                    this.displayQuestion(this.currentQuestionIndex + 1);
                }
            }

            updateNavigationButtons() {
                const prevBtn = document.getElementById('prevBtn');
                const nextBtn = document.getElementById('nextBtn');
                const submitBtn = document.getElementById('submitBtn');
                
                // Disable previous button if on first question
                prevBtn.disabled = this.currentQuestionIndex === 0;
                
                // Show submit button if on last question, otherwise show next button
                if (this.currentQuestionIndex === this.questions.length - 1) {
                    nextBtn.classList.add('hidden');
                    submitBtn.classList.remove('hidden');
                } else {
                    nextBtn.classList.remove('hidden');
                    submitBtn.classList.add('hidden');
                }
            }

            updateQuestionNavigation() {
                const navigationContainer = document.getElementById('questionNavigation');
                navigationContainer.innerHTML = '';
                
                this.questions.forEach((question, index) => {
                    const button = document.createElement('button');
                    button.className = 'question-nav-btn';
                    button.textContent = question.id;
                    
                    if (index === this.currentQuestionIndex) {
                        button.classList.add('active');
                    }
                    
                    if (question.isAnswered()) {
                        button.classList.add('answered');
                    }
                    
                    button.addEventListener('click', () => {
                        this.displayQuestion(index);
                    });
                    
                    navigationContainer.appendChild(button);
                });
            }

            submitExam() {
                try {
                    // Save current answer and stop timer
                    this.saveCurrentAnswer();
                    this.questions[this.currentQuestionIndex].stopTimer();
                    
                    // Check if all questions are answered
                    const unansweredQuestions = this.questions.filter(q => !q.isAnswered());
                    
                    if (unansweredQuestions.length > 0) {
                        const confirmSubmit = confirm(`You have ${unansweredQuestions.length} unanswered question(s). Are you sure you want to submit?`);
                        if (!confirmSubmit) {
                            // Restart timer for current question
                            this.questions[this.currentQuestionIndex].startTimer();
                            return;
                        }
                    }
                    
                    // Stop timer
                    clearInterval(this.timerInterval);
                    this.examEndTime = new Date();
                    
                    // Calculate results
                    const results = this.calculateResults();
                    
                    // Display results
                    this.displayResults(results);
                    
                    // Hide exam screen and show result screen
                    document.getElementById('examScreen').classList.add('hidden');
                    document.getElementById('resultScreen').classList.remove('hidden');
                    
                    this.showNotification("Exam submitted successfully!", 'success');
                } catch (error) {
                    this.showNotification(error.message, 'error');
                }
            }

            calculateResults() {
                let correctCount = 0;
                let incorrectCount = 0;
                let mcqCorrect = 0;
                let mcqTotal = 0;
                let tfCorrect = 0;
                let tfTotal = 0;
                let totalTimeSpent = 0;
                
                this.questions.forEach(question => {
                    try {
                        totalTimeSpent += question.timeSpent;
                        
                        if (question.isAnswered()) {
                            if (question.isCorrect()) {
                                correctCount++;
                                
                                if (question instanceof MCQQuestion) {
                                    mcqCorrect++;
                                } else if (question instanceof TrueFalseQuestion) {
                                    tfCorrect++;
                                }
                            } else {
                                incorrectCount++;
                            }
                        } else {
                            incorrectCount++;
                        }
                        
                        if (question instanceof MCQQuestion) {
                            mcqTotal++;
                        } else if (question instanceof TrueFalseQuestion) {
                            tfTotal++;
                        }
                    } catch (error) {
                        console.error(error);
                        incorrectCount++;
                    }
                });
                
                const score = Math.round((correctCount / this.questions.length) * 100);
                const timeTaken = this.examEndTime - this.examStartTime;
                const minutes = Math.floor(timeTaken / 60000);
                const seconds = Math.floor((timeTaken % 60000) / 1000);
                const timeTakenStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                const avgTimePerQuestion = Math.round(totalTimeSpent / this.questions.length / 1000);
                const accuracy = Math.round((correctCount / this.questions.length) * 100);
                
                let performance = 'Poor';
                if (score >= 90) performance = 'Excellent';
                else if (score >= 80) performance = 'Very Good';
                else if (score >= 70) performance = 'Good';
                else if (score >= 60) performance = 'Average';
                else if (score >= 50) performance = 'Below Average';
                
                const mcqScore = mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : 0;
                const tfScore = tfTotal > 0 ? Math.round((tfCorrect / tfTotal) * 100) : 0;
                
                return {
                    score,
                    correctCount,
                    incorrectCount,
                    timeTaken: timeTakenStr,
                    avgTimePerQuestion,
                    accuracy,
                    performance,
                    mcqScore,
                    tfScore
                };
            }

            displayResults(results) {
                // Update score display
                document.getElementById('scoreDisplay').textContent = `${results.score}%`;
                document.getElementById('correctCount').textContent = results.correctCount;
                document.getElementById('incorrectCount').textContent = results.incorrectCount;
                document.getElementById('timeTaken').textContent = results.timeTaken;
                
                // Update performance metrics
                document.getElementById('avgTimePerQuestion').textContent = `${results.avgTimePerQuestion}s`;
                document.getElementById('accuracy').textContent = `${results.accuracy}%`;
                document.getElementById('performance').textContent = results.performance;
                
                // Update grade circle
                const gradeCircle = document.getElementById('gradeCircle');
                const gradeText = document.getElementById('gradeText');
                const gradeLabel = document.getElementById('gradeLabel');
                
                gradeCircle.style.setProperty('--grade-percent', `${results.score}%`);
                
                let grade = 'F';
                let label = 'Fail';
                
                if (results.score >= 90) {
                    grade = 'A+';
                    label = 'Excellent';
                } else if (results.score >= 85) {
                    grade = 'A';
                    label = 'Very Good';
                } else if (results.score >= 80) {
                    grade = 'B+';
                    label = 'Good';
                } else if (results.score >= 75) {
                    grade = 'B';
                    label = 'Good';
                } else if (results.score >= 70) {
                    grade = 'C+';
                    label = 'Average';
                } else if (results.score >= 65) {
                    grade = 'C';
                    label = 'Average';
                } else if (results.score >= 60) {
                    grade = 'D';
                    label = 'Pass';
                }
                
                gradeText.textContent = grade;
                gradeLabel.textContent = label;
                
                // Update performance chart
                setTimeout(() => {
                    document.getElementById('mcqBar').style.height = `${results.mcqScore}%`;
                    document.getElementById('mcqValue').textContent = `${results.mcqScore}%`;
                    document.getElementById('tfBar').style.height = `${results.tfScore}%`;
                    document.getElementById('tfValue').textContent = `${results.tfScore}%`;
                }, 500);
                
                // Update result message
                let message = '';
                if (results.score >= 80) {
                    message = `Outstanding performance, ${this.studentName}! You scored ${results.score}%. Your understanding of programming concepts is excellent.`;
                } else if (results.score >= 60) {
                    message = `Good job, ${this.studentName}! You scored ${results.score}%. You have a solid understanding of programming concepts.`;
                } else {
                    message = `${this.studentName}, you scored ${results.score}%. Consider reviewing the material to improve your understanding of programming concepts.`;
                }
                
                document.getElementById('resultMessage').textContent = message;
            }

            resetExam() {
                // Reset exam state
                this.currentQuestionIndex = 0;
                this.examStartTime = null;
                this.examEndTime = null;
                this.studentName = '';
                this.studentId = '';
                
                // Reset questions
                this.questions.forEach(question => {
                    question.userAnswer = null;
                    question.timeSpent = 0;
                    question.startTime = null;
                });
                
                // Reset form
                document.getElementById('studentName').value = '';
                document.getElementById('studentId').value = '';
                document.getElementById('nameError').style.display = 'none';
                document.getElementById('idError').style.display = 'none';
                
                // Reset timer display
                document.getElementById('timeDisplay').textContent = '15:00';
                document.getElementById('timeDisplay').style.color = '#fb6340';
                
                // Reset progress
                document.getElementById('progressBar').style.width = '0%';
                document.getElementById('progressText').textContent = '0%';
                
                // Reset performance chart
                document.getElementById('mcqBar').style.height = '0%';
                document.getElementById('mcqValue').textContent = '0%';
                document.getElementById('tfBar').style.height = '0%';
                document.getElementById('tfValue').textContent = '0%';
                
                // Show welcome screen and hide result screen
                document.getElementById('resultScreen').classList.add('hidden');
                document.getElementById('welcomeScreen').classList.remove('hidden');
            }

            showNotification(message, type) {
                const notification = document.getElementById('notification');
                const notificationText = document.getElementById('notificationText');
                const icon = notification.querySelector('i');
                
                notificationText.textContent = message;
                notification.className = `notification ${type}`;
                
                // Update icon based on type
                if (type === 'error') {
                    icon.className = 'fas fa-exclamation-circle';
                } else if (type === 'success') {
                    icon.className = 'fas fa-check-circle';
                } else if (type === 'warning') {
                    icon.className = 'fas fa-exclamation-triangle';
                }
                
                // Show notification
                setTimeout(() => {
                    notification.classList.add('show');
                }, 100);
                
                // Hide notification after 3 seconds
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }
        }

        // Initialize the exam system when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            new ExamSystem();
        });
  