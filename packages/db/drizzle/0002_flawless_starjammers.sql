ALTER TABLE "bookings" ADD COLUMN "mentor_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "learner_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "project_applications" ADD CONSTRAINT "project_applications_project_applicant_unique" UNIQUE("project_id","applicant_id");--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_unique" UNIQUE("booking_id");