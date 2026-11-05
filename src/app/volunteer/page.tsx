import VolunteerForm from '@/components/forms/VolunteerForm';

export default function VolunteerPage() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-100 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Join the Movement
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Become a part of the team dedicated to bringing positive change to Amuwo-Odofin. Your time, skills, and passion can make a real difference.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <div className="w-full max-w-2xl">
              <VolunteerForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}