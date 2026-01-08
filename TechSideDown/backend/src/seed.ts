import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EventsService } from './events/events.service';
import { CreateEventDto } from './events/dto/create-event.dto';
import { UsersService } from './users/users.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const eventsService = app.get(EventsService);

    const events: CreateEventDto[] = [
        {
            title: "TECHXPRESSION × CSI HACKATHON",
            category: "Hackathon",
            description: "25 Hours | Jan 30–31 | IT Block (1st Floor). AI, Web, Data & Automation-based problem solving.",
            duration: "25 Hours",
            difficulty: "Nightmare",
            date: new Date("2025-01-30"),
            location: "IT Block (1st Floor)",
            fee: 0
        },
        {
            title: "AI CRAFT EXPO",
            category: "AI Exhibition",
            description: "Jan 30–31 | Main Lawn / IoT Lab. Showcase of AI, ML, automation, and research models.",
            duration: "2 Days",
            difficulty: "Expert",
            date: new Date("2025-01-30"),
            location: "Main Lawn / IoT Lab",
            fee: 250
        },
        {
            title: "ESCAPE FROM UPSIDE",
            category: "Escape Room",
            description: "Jan 30–31 | Rooms 208/209. Stranger Things–style puzzle and logic escape challenge (Teams of 3).",
            duration: "Timed",
            difficulty: "Hard",
            date: new Date("2025-01-30"),
            location: "Rooms 208/209",
            fee: 100
        },
        {
            title: "PALACE ARCADE",
            category: "E-Sports",
            description: "Jan 30 | NR 309/310. Mobile gaming tournament (TPP Squad, Teams of 4).",
            duration: "1 Day",
            difficulty: "Hard",
            date: new Date("2025-01-30"),
            location: "NR 309/310",
            fee: 400
        },
        {
            title: "PROJECT HAWKINS",
            category: "Upside-Down Coding",
            description: "Jan 31. Solo coding contest with inverted logic and twisted constraints.",
            duration: "1 Day",
            difficulty: "Nightmare",
            date: new Date("2025-01-31"),
            location: "TBD",
            fee: 100
        },
        {
            title: "CLOSE THE GATES",
            category: "Capture The Flag",
            description: "Jan 31. Solo cybersecurity challenge (Easy to Hard rounds).",
            duration: "1 Day",
            difficulty: "Expert",
            date: new Date("2025-01-31"),
            location: "TBD",
            fee: 100
        },
        {
            title: "CARNIVAL 011",
            category: "Techstar Unplugged",
            description: "Jan 31 | Main Lawn / Seminar Hall. Cultural events including singing, dance, open mic, and performances.",
            duration: "1 Day",
            difficulty: "Medium",
            date: new Date("2025-01-31"),
            location: "Main Lawn / Seminar Hall",
            fee: 100
        },
        {
            title: "CAPTURE THE MOMENT",
            category: "Photography",
            description: "Jan 30-31. Photography event capturing the essence of the fest.",
            duration: "2 Days",
            difficulty: "Easy",
            date: new Date("2025-01-30"),
            location: "No Location",
            fee: 50
        }
    ];

    // Clear existing events
    await eventsService.removeAll();
    console.log('Cleared existing events');

    for (const event of events) {
        try {
            await eventsService.create(event);
            console.log(`Created event: ${event.title}`);
        } catch (error) {
            console.error(`Failed to create event ${event.title}:`, error.message);
        }
    }

    const usersService = app.get(UsersService);
    const admins = [
        {
            username: "Sanskar",
            password: "TX001",
            email: "sanskar@tx.com", // Dummy email
            role: "admin",
            college: "TX University",
            team: [],
            points: 0
        },
        {
            username: "Faculty",
            password: "TX011",
            email: "faculty@tx.com", // Dummy email
            role: "admin",
            college: "TX University",
            team: [],
            points: 0
        }
    ];

    for (const admin of admins) {
        try {
            await usersService.create(admin);
            console.log(`Created admin: ${admin.username}`);
        } catch (error) {
            console.log(`Admin ${admin.username} might already exist or failed: ${error.message}`);
        }
    }

    await app.close();
}

bootstrap();
