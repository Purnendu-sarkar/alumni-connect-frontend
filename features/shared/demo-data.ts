import type { Alumni, Job } from '@/types/domain';

export const demoAlumni: Alumni[] = [
  { id: 'sadia-rahman', name: 'Sadia Rahman', batch: '2016', department: 'Computer Science', currentCompany: 'Pathao', position: 'Product Lead', bio: 'Building digital products that move people and ideas.', skills: ['Product', 'Strategy', 'Mentorship'], avatarUrl: null },
  { id: 'tanvir-hossain', name: 'Tanvir Hossain', batch: '2014', department: 'CSE', currentCompany: 'Brain Station 23', position: 'Engineering Manager', bio: 'Backend engineer turned people builder.', skills: ['Node.js', 'System design', 'Career'], avatarUrl: null },
  { id: 'maria-islam', name: 'Maria Islam', batch: '2018', department: 'Business Administration', currentCompany: 'Unilever', position: 'Brand Manager', bio: 'Turning sharp insight into brands people remember.', skills: ['Marketing', 'Brand', 'Leadership'], avatarUrl: null },
  { id: 'arif-uddin', name: 'Arif Uddin', batch: '2015', department: 'EEE', currentCompany: 'Grameenphone', position: 'Solutions Architect', bio: 'Helping teams translate big systems into simple decisions.', skills: ['Cloud', 'Architecture', 'IoT'], avatarUrl: null },
  { id: 'nafisa-chowdhury', name: 'Nafisa Chowdhury', batch: '2019', department: 'CSE', currentCompany: 'ShopUp', position: 'UX Researcher', bio: 'A curious listener with a bias for useful interfaces.', skills: ['Research', 'UX', 'Design'], avatarUrl: null },
  { id: 'rakib-ahmed', name: 'Rakib Ahmed', batch: '2013', department: 'Economics', currentCompany: 'BRAC', position: 'Programme Director', bio: 'Designing programmes that create durable opportunity.', skills: ['Policy', 'Impact', 'Leadership'], avatarUrl: null },
];

export const demoJobs: Job[] = [
  { id: 'job-1', title: 'Software Engineer, Platform', company: 'bKash', location: 'Dhaka · Hybrid', employmentType: 'Full-time', description: 'Build reliable services powering financial access for millions of people.', applicationUrl: '#apply', applicationEmail: null, expiresAt: '2026-10-01T00:00:00.000Z', createdAt: '2026-09-08T00:00:00.000Z', postedBy: { id: 'sadia-rahman', name: 'Sadia Rahman', currentCompany: 'Pathao' } },
  { id: 'job-2', title: 'Product Design Intern', company: '10 Minute School', location: 'Dhaka · On-site', employmentType: 'Internship', description: 'Research, prototype, and ship learning experiences with a multidisciplinary product team.', applicationUrl: '#apply', applicationEmail: null, expiresAt: '2026-09-25T00:00:00.000Z', createdAt: '2026-09-06T00:00:00.000Z', postedBy: { id: 'maria-islam', name: 'Maria Islam', currentCompany: 'Unilever' } },
  { id: 'job-3', title: 'Associate, Growth & Partnerships', company: 'Shikho', location: 'Dhaka · Hybrid', employmentType: 'Full-time', description: 'Create partnerships that help every learner take their next confident step.', applicationUrl: '#apply', applicationEmail: null, expiresAt: null, createdAt: '2026-09-04T00:00:00.000Z', postedBy: { id: 'rakib-ahmed', name: 'Rakib Ahmed', currentCompany: 'BRAC' } },
];
