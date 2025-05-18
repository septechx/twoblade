import { randomUUID } from 'crypto';
import { getSession, setSession, deleteSession } from './redis';

type Question = {
    question: string;
    options: string[];
    correctIndex: number;
    imageUrls?: string[];
};

type TestSession = {
    id: string;
    currentSection: 'brainrot' | 'math' | 'literacy';
    questionIndex: number;
    answers: number[];
    correctAnswers: number;
    completed: boolean;
    score?: number;
    brainrotQuestions: number[];
    mathQuestions: number[];
    literacyQuestions: number[];
    currentCorrectIndex: number | null;
};

type MathQuestionGenerator = {
    generate: () => {
        question: string;
        options: string[];
        correctIndex: number;
    };
};

const characters = [
    { name: 'Aeromucca Armata', codename: 'nah-dawg-01', image_type: "jpg" },
    { name: 'Ballerina Cappuccina', codename: 'nah-dawg-02', image_type: "jpg" },
    { name: 'Ballerina Nicotina', codename: 'nah-dawg-03', image_type: "jpg" },
    { name: 'Bobrini Cactusini', codename: 'nah-dawg-04', image_type: "jpg" },
    { name: 'Bombardiro Crocodilo', codename: 'nah-dawg-05', image_type: "gif" },
    { name: 'Bomboclat Crocolat', codename: 'nah-dawg-06', image_type: "jpg" },
    { name: 'Bombombini Gusini', codename: 'nah-dawg-07', image_type: "jpg" },
    { name: 'Brr Brr Patapim', codename: 'nah-dawg-08', image_type: "jpg" },
    { name: 'Bruto Gialutto', codename: 'nah-dawg-09', image_type: "jpg" },
    { name: 'Cappucino Assassino', codename: 'nah-dawg-10', image_type: "jpg" },
    { name: 'Capybarello Cocosini', codename: 'nah-dawg-11', image_type: "jpg" },
    { name: 'Chimpanzini Bananini', codename: 'nah-dawg-12', image_type: "jpg" },
    { name: 'Crocodilo Potatino', codename: 'nah-dawg-13', image_type: "jpg" },
    { name: 'Fenicottero Elegante', codename: 'nah-dawg-14', image_type: "jpg" },
    { name: 'Frigo Camelo', codename: 'nah-dawg-15', image_type: "jpg" },
    { name: 'Frr Frr Chimpanifriti', codename: 'nah-dawg-16', image_type: "jpg" },
    { name: 'Ganganzeli Trulala', codename: 'nah-dawg-17', image_type: "jpg" },
    { name: 'Gangster Footera Criminalera', codename: 'nah-dawg-18', image_type: "jpg" },
    { name: 'Legeni Peshkaqeni', codename: 'nah-dawg-19', image_type: "jpg" },
    { name: 'Lirili Larila', codename: 'nah-dawg-20', image_type: "jpg" },
    { name: 'Merluzzini Marraquetini', codename: 'nah-dawg-21', image_type: "jpg" },
    { name: 'Orangutini Ananasini', codename: 'nah-dawg-22', image_type: "jpg" },
    { name: 'Pararell Bararell', codename: 'nah-dawg-23', image_type: "jpg" },
    { name: 'Piccione Macchina', codename: 'nah-dawg-24', image_type: "jpg" },
    { name: 'Skibidetto Toaletto', codename: 'nah-dawg-25', image_type: "jpg" },
    { name: 'Spijuniro Golubiro', codename: 'nah-dawg-26', image_type: "jpg" },
    { name: 'Tirilicalica Tirilicalaco', codename: 'nah-dawg-27', image_type: "jpg" },
    { name: 'Tracotucotulu Delapeladusduz', codename: 'nah-dawg-28', image_type: "jpg" },
    { name: 'Tralalelo Tralala', codename: 'nah-dawg-29', image_type: "gif" },
    { name: 'Trippi Troppi', codename: 'nah-dawg-30', image_type: "jpg" },
    { name: 'Tung Tung Tung Sahur', codename: 'nah-dawg-31', image_type: "jpg" },
]
const literacyQuestions: Array<Question> = [
    {
        question: "What does 'API' stand for?",
        options: [
            "Application Programming Interface",
            "Automated Program Installation",
            "Afuck Pfuck Ifuck",
            "Application Process Inventory"
        ],
        correctIndex: 0
    },
    {
        question: "What is the purpose of HTTP?",
        options: [
            "To transfer data between web servers and clients",
            "To store data in databases",
            "To encrypt Instagram",
            "To compress image files"
        ],
        correctIndex: 0
    },
    {
        question: "What does 'CSS' stand for?",
        options: [
            "Cascading Style Sheets",
            "Counter Strike Source",
            "Creative Style Syntax",
            "Content Styling Service"
        ],
        correctIndex: 0
    },
    {
        question: "What is a DNS server's primary function?",
        options: [
            "Converting domain names to IP addresses",
            "Storing website files to Disk",
            "Processing payments",
            "china"
        ],
        correctIndex: 0
    },
    {
        question: "What is RAM used for?",
        options: [
            "Temporary data storage while programs are running",
            "ChatGPT",
            "Processing graphics",
            "Network communication"
        ],
        correctIndex: 0
    },
    {
        question: "What is a firewall?",
        options: [
            "A security system that monitors network traffic",
            "A type of computer virus",
            "An extension for Firefox",
            "A programming language"
        ],
        correctIndex: 0
    },
    {
        question: "What does 'URL' stand for?",
        options: [
            "Uniform Resource Locator",
            "Universal Reference Link",
            "Universal Recursive Language",
            "Unified Resource Library"
        ],
        correctIndex: 0
    },
    {
        question: "What is the 'cloud' in cloud computing?",
        options: [
            "Remote servers accessed via the internet",
            "A type of weather monitoring system",
            "A literal cloud in the sky, dumbfuck",
            "A wireless network protocol"
        ],
        correctIndex: 0
    },
    {
        question: "What is an SSD?",
        options: [
            "A storage device with no moving parts",
            "A type of computer monitor",
            "A network security protocol",
            "A taiwanese large language model"
        ],
        correctIndex: 0
    },
    {
        question: "What does 'HTML' stand for?",
        options: [
            "HyperText Markup Language",
            "High-Tech Machine Learning",
            "How To Meet Ladies",
            "Hard To Make Laugh"
        ],
        correctIndex: 0
    },
    {
        question: "What is a cookie in web terms?",
        options: [
            "A small piece of data stored by websites on your computer",
            "A literal fucking cookie",
            "A programming language",
            "A network security protocol"
        ],
        correctIndex: 0
    },
    {
        question: "What is bandwidth?",
        options: [
            "The amount of data that can be transmitted in a fixed time",
            "A type of wireless connection",
            "The physical size of a network cable",
            "Screen resolution"
        ],
        correctIndex: 0
    },
    {
        question: "What is a GPU?",
        options: [
            "Graphics Processing Unit",
            "General Processing Unit",
            "Greatest Pizza Universe",
            "Graphical Program Utility"
        ],
        correctIndex: 0
    },
    {
        question: "What is phishing?",
        options: [
            "Attempting to steal sensitive information by posing as a trustworthy entity",
            "A type of fishing technique programmers use because they are nerds",
            "A method of data encryption via email, particuarly for the Chinese",
            "A programming language paradigm, hated by many",
        ],
        correctIndex: 0
    },
];

function ensureUniqueOptions(correct: number, generateDistractors: () => number[]): string[] {
    const uniqueOptions = new Set<number>([correct]);

    while (uniqueOptions.size < 4) {
        generateDistractors().forEach(d => uniqueOptions.add(d));
    }

    return shuffleArray([...uniqueOptions].slice(0, 4)).map(String);
}

const mathQuestions: MathQuestionGenerator[] = [
    {
        generate: () => {
            const x = Math.floor(Math.random() * 10) + 1;
            const result = 2 * x + 5;
            const correct = x;
            const options = shuffleArray([
                correct,
                correct + 2,
                correct - 1,
                correct + 1
            ]).map(String);
            return {
                question: `If 2x + 5 = ${result}, what is x?`,
                options,
                correctIndex: options.indexOf(String(correct))
            };
        }
    },
    {
        generate: () => {
            const base = Math.floor(Math.random() * 5) + 2;
            const exp = Math.floor(Math.random() * 3) + 2;
            const result = Math.pow(base, exp);
            const correct = exp;
            const options = shuffleArray([exp, exp + 1, exp - 1, exp + 2]).map(String);
            return {
                question: `What exponent is needed to get ${result} when the base is ${base}? (${base}^x = ${result})`,
                options,
                correctIndex: options.indexOf(String(correct))
            };
        }
    },
    {
        generate: () => {
            const num1 = Math.floor(Math.random() * 50) + 50;
            const num2 = Math.floor(Math.random() * 30) + 20;
            const correct = num1 - num2;
            const options = shuffleArray([
                correct,
                correct + 5,
                correct - 5,
                correct + 10
            ]).map(String);
            return {
                question: `What is ${num1} - ${num2}?`,
                options,
                correctIndex: options.indexOf(String(correct))
            };
        }
    },
    {
        generate: () => {
            const multiplier = Math.floor(Math.random() * 5) + 2;
            const numbers = Array.from({ length: 4 }, (_, i) => multiplier * (i + 1));
            const correct = multiplier * 5;
            const options = shuffleArray([
                correct,
                correct + multiplier,
                correct - multiplier,
                correct + (multiplier * 2)
            ]).map(String);
            return {
                question: `What comes next in the sequence: ${numbers.join(', ')}, ...?`,
                options,
                correctIndex: options.indexOf(String(correct))
            };
        }
    },
    {
        generate: () => {
            const a = Math.floor(Math.random() * 9) + 2; // 2-10 to avoid a=1
            const b = Math.floor(Math.random() * 10) + 1;
            const c = a * b;
            const correct = b;

            const options = ensureUniqueOptions(correct, () => [
                b + 2,
                Math.max(1, b - 2),
                c,
                Math.floor(c / 2),
                c + 1,
                Math.max(1, b - 1),
                b + 1
            ]);

            return {
                question: `If ${a}x = ${c}, what is x?`,
                options,
                correctIndex: options.indexOf(String(correct))
            };
        }
    },
    {
        generate: () => {
            const sides = Math.floor(Math.random() * 4) + 3;
            const length = Math.floor(Math.random() * 10) + 5;
            const correct = sides * length;
            const options = shuffleArray([
                correct,
                (sides - 1) * length,
                (sides + 1) * length,
                Math.round(correct * 1.5)
            ]).map(String);
            return {
                question: `What is the perimeter of a regular polygon with ${sides} sides, each ${length} units long?`,
                options,
                correctIndex: options.indexOf(String(correct))
            };
        }
    },
    {
        generate: () => {
            const speed = Math.floor(Math.random() * 30) + 40;
            const time = Math.floor(Math.random() * 3) + 2;
            const correct = speed * time;
            const options = shuffleArray([
                correct,
                correct + speed,
                correct - speed,
                Math.round(correct * 1.5)
            ]).map(String);
            return {
                question: `If a car travels at ${speed} mph for ${time} hours, how many miles does it travel?`,
                options,
                correctIndex: options.indexOf(String(correct))
            };
        }
    },
    {
        generate: () => {
            const start = Math.floor(Math.random() * 50) + 50;
            const rate = Math.floor(Math.random() * 10) + 5;
            const years = Math.floor(Math.random() * 3) + 2;
            const correct = start + (rate * years);
            const options = shuffleArray([
                correct,
                start + (rate * (years - 1)),
                start + (rate * (years + 1)),
                start * years
            ]).map(String);
            return {
                question: `Starting with ${start} and adding ${rate} each year, what's the total after ${years} years?`,
                options,
                correctIndex: options.indexOf(String(correct))
            };
        }
    },
    {
        generate: () => {
            const divisor = Math.floor(Math.random() * 5) + 2;
            const result = Math.floor(Math.random() * 20) + 10;
            const correct = divisor * result;
            const options = shuffleArray([
                correct,
                correct + divisor,
                correct - divisor,
                correct * 2
            ]).map(String);
            return {
                question: `What number divided by ${divisor} equals ${result}?`,
                options,
                correctIndex: options.indexOf(String(correct))
            };
        }
    },
    {
        generate: () => {
            const side = Math.floor(Math.random() * 10) + 5;
            const correct = side * side;
            const options = shuffleArray([
                correct,
                side * 4,
                (side + 1) * (side + 1),
                (side - 1) * (side - 1)
            ]).map(String);
            return {
                question: `What is the area of a square with sides of length ${side}?`,
                options,
                correctIndex: options.indexOf(String(correct))
            };
        }
    },
    {
        generate: () => {
            const hours = Math.floor(Math.random() * 12) + 1;
            const minutes = Math.floor(Math.random() * 60);

            const hourAngle = (hours % 12 + minutes / 60) * 30;
            const minuteAngle = minutes * 6;

            const angleDiff = Math.abs(hourAngle - minuteAngle);
            const correct = Math.min(angleDiff, 360 - angleDiff);
            const roundedCorrect = Math.round(correct);

            const options = ensureUniqueOptions(roundedCorrect, () => {
                const reflexAngle = Math.round(360 - correct); // Common mistake
                const complementaryAngle = Math.round(90 - correct); // Another common mistake
                return [
                    reflexAngle,
                    complementaryAngle,
                    roundedCorrect + 15,
                    roundedCorrect - 15,
                    roundedCorrect + 30,
                    // Ensure all values are positive and ≤ 180
                    ...[-45, -30, -15, 15, 30, 45].map(offset =>
                        Math.abs((roundedCorrect + offset + 180) % 180)
                    )
                ].filter(angle => angle > 0 && angle <= 180);
            });

            return {
                question: `What is the smaller angle (in degrees) between the hour and minute hands at ${hours}:${minutes.toString().padStart(2, '0')}?`,
                options,
                correctIndex: options.indexOf(String(roundedCorrect))
            };
        }
    },
    {
        generate: () => {
            const width = Math.floor(Math.random() * 10) + 5;
            const length = Math.floor(Math.random() * 10) + width;
            const correct = 2 * (width + length);
            const options = shuffleArray([
                correct,
                width * length,
                2 * width + length,
                2 * (width * length)
            ]).map(String);
            return {
                question: `What is the perimeter of a rectangle with width ${width} and length ${length}?`,
                options,
                correctIndex: options.indexOf(String(correct))
            };
        }
    },
    {
        generate: () => {
            const number = Math.floor(Math.random() * 900) + 100;
            const correct = number.toString().split('').reduce((a, b) => a + parseInt(b), 0);
            const options = shuffleArray([
                correct,
                correct + 1,
                correct - 1,
                correct + 2
            ]).map(String);
            return {
                question: `What is the sum of all digits in the number ${number}?`,
                options,
                correctIndex: options.indexOf(String(correct))
            };
        }
    }
];

const MAX_QUESTIONS_PER_SECTION = 5;

function generateRandomIndexes(max: number, count: number): number[] {
    const indexes = Array.from({ length: max }, (_, i) => i);
    return shuffleArray(indexes).slice(0, count);
}

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function getRandomCharacters(targetCharacter: typeof characters[0], count: number) {
    const availableCharacters = characters.filter(char => char.name !== targetCharacter.name);
    return shuffleArray(availableCharacters).slice(0, count);
}

export async function createIQSession(): Promise<string> {
    const sessionId = randomUUID();
    const session: TestSession = {
        id: sessionId,
        currentSection: 'brainrot',
        questionIndex: 0,
        answers: [],
        correctAnswers: 0,
        completed: false,
        brainrotQuestions: generateRandomIndexes(characters.length, 5),
        mathQuestions: generateRandomIndexes(mathQuestions.length, 5),
        literacyQuestions: generateRandomIndexes(literacyQuestions.length, 5),
        currentCorrectIndex: null
    };

    await setSession(session);
    return sessionId;
}

export async function getSessionScore(sessionId: string): Promise<number | undefined> {
    const session = await getSession(sessionId);
    if (session?.completed) {
        return session.score;
    }
    return undefined;
}

export async function getCurrentQuestion(sessionId: string): Promise<{ question: Omit<Question, 'correctIndex'> } | { error: string }> {
    console.time(`getCurrentQuestion_total_${sessionId}`);
    console.time(`getSession_${sessionId}`);
    const session = await getSession(sessionId);
    console.timeEnd(`getSession_${sessionId}`);

    if (!session) {
        console.timeEnd(`getCurrentQuestion_total_${sessionId}`);
        return { error: 'Invalid session' };
    }
    if (session.completed) {
        console.timeEnd(`getCurrentQuestion_total_${sessionId}`);
        return { error: 'Session already completed' };
    }

    console.time(`generateQuestion_${sessionId}`);
    const question = generateQuestion(session.currentSection, session.questionIndex, session);
    console.timeEnd(`generateQuestion_${sessionId}`);

    session.currentCorrectIndex = question.correctIndex;

    console.time(`setSession_${sessionId}`);
    await setSession(session);
    console.timeEnd(`setSession_${sessionId}`);

    console.timeEnd(`getCurrentQuestion_total_${sessionId}`);

    const { correctIndex: _, ...safeQuestion } = question;

    return {
        question: safeQuestion
    };
}

export async function submitAnswer(sessionId: string, answer: number): Promise<{
    completed: boolean;
    nextSection?: string;
    questionIndex: number;
    score?: number;
} | { error: string }> {
    const session = await getSession(sessionId);
    if (!session) {
        return { error: 'Invalid session' };
    }
    if (session.completed) {
        return { error: 'Session already completed' };
    }
    if (session.currentCorrectIndex === null) {
        return { error: 'No question active or question already answered' };
    }

    const expectedCorrectIndex = session.currentCorrectIndex;
    const isCorrect = expectedCorrectIndex === answer;

    session.answers.push(answer);
    if (isCorrect) {
        session.correctAnswers++;
    }

    session.currentCorrectIndex = null;
    session.questionIndex++;

    if (session.questionIndex >= MAX_QUESTIONS_PER_SECTION) {
        session.questionIndex = 0;
        switch (session.currentSection) {
            case 'brainrot':
                session.currentSection = 'math';
                break;
            case 'math':
                session.currentSection = 'literacy';
                break;
            case 'literacy':
                session.completed = true;
                session.score = calculateScore(session.correctAnswers);
                break;
        }
    }

    await setSession(session);

    return {
        completed: session.completed,
        nextSection: session.currentSection,
        questionIndex: session.questionIndex,
        score: session.score
    };
}

export async function deleteSession_(sessionId: string): Promise<boolean> {
    return await deleteSession(sessionId);
}

function calculateScore(correctAnswers: number): number {
    return Math.round((correctAnswers / 15) * 100) + 50;
}

function generateBrainrotQuestion(index: number): Question {
    const targetCharacter = characters[index % characters.length];
    const otherCharacters = getRandomCharacters(targetCharacter, 3);
    const allCharacters = shuffleArray([targetCharacter, ...otherCharacters]);
    const correctIndex = allCharacters.findIndex(char => char.name === targetCharacter.name);

    const imageUrls = allCharacters.map(char =>
        `/iq/brainrot/images/${char.codename}.${char.image_type}`
    );

    return {
        question: `Which image shows ${targetCharacter.name}?`,
        options: [],
        imageUrls,
        correctIndex
    };
}

function generateMathQuestion(index: number): Question {
    return mathQuestions[index % mathQuestions.length].generate();
}

function generateLiteracyQuestion(index: number): Question {
    const question = literacyQuestions[index % literacyQuestions.length];
    const originalCorrect = question.options[question.correctIndex];
    const shuffledOptions = shuffleArray([...question.options]);

    return {
        question: question.question,
        options: shuffledOptions,
        correctIndex: shuffledOptions.indexOf(originalCorrect)
    };
}

function generateQuestion(
    section: 'brainrot' | 'math' | 'literacy',
    index: number,
    session: TestSession
): Question {
    switch (section) {
        case 'brainrot':
            return generateBrainrotQuestion(session.brainrotQuestions[index]);
        case 'math':
            return generateMathQuestion(session.mathQuestions[index]);
        case 'literacy':
            return generateLiteracyQuestion(session.literacyQuestions[index]);
    }
}

export { type Question, type TestSession };
