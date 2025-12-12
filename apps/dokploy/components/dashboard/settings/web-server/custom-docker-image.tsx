import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Box, Loader2, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AlertBlock } from "@/components/shared/alert-block";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/utils/api";

const formSchema = z.object({
	customDockerImage: z.string().min(1, "Docker image is required"),
});

type FormValues = z.infer<typeof formSchema>;

export const CustomDockerImage = () => {
	const [isOpen, setIsOpen] = useState(false);

	const { data: customDockerImage, isLoading } =
		api.settings.getCustomDockerImage.useQuery();
	const utils = api.useUtils();

	const { mutateAsync: updateCustomDockerImage, isLoading: isUpdating } =
		api.settings.updateCustomDockerImage.useMutation({
			onSuccess: () => {
				utils.settings.getCustomDockerImage.invalidate();
			},
		});

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			customDockerImage: "",
		},
	});

	useEffect(() => {
		if (customDockerImage) {
			form.reset({ customDockerImage });
		}
	}, [customDockerImage, form]);

	const onSubmit = async (data: FormValues) => {
		try {
			await updateCustomDockerImage({
				customDockerImage: data.customDockerImage,
			});
			toast.success("Custom Docker image saved successfully");
			setIsOpen(false);
		} catch (error) {
			toast.error("Failed to save custom Docker image");
		}
	};

	const handleRemove = async () => {
		try {
			await updateCustomDockerImage({
				customDockerImage: null,
			});
			form.reset({ customDockerImage: "" });
			toast.success("Custom Docker image removed. Using official image.");
			setIsOpen(false);
		} catch (error) {
			toast.error("Failed to remove custom Docker image");
		}
	};

	if (isLoading) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
				>
					{customDockerImage ? "Change" : "Configure"}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Box className="h-5 w-5" />
						Custom Docker Image
					</DialogTitle>
					<DialogDescription>
						Configure a custom Docker image for Dokploy updates. This allows you
						to use your own fork or modified version of Dokploy.
					</DialogDescription>
				</DialogHeader>

				<AlertBlock type="warning">
					<div className="flex items-start gap-2">
						<AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
						<div>
							<p className="font-medium">Use with caution</p>
							<p className="text-sm mt-1">
								Using a custom Docker image means updates will pull from your
								specified image instead of the official Dokploy repository. Make
								sure your image is compatible and trusted.
							</p>
						</div>
					</div>
				</AlertBlock>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="customDockerImage"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Docker Image</FormLabel>
									<FormControl>
										<Input
											placeholder="ghcr.io/username/dokploy:tag"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Enter the full Docker image path including registry and tag.
										<br />
										Examples:
										<ul className="list-disc list-inside mt-1 text-xs">
											<li>ghcr.io/username/dokploy-fork:canary</li>
											<li>docker.io/username/dokploy:v1.0.0</li>
											<li>registry.example.com/dokploy:latest</li>
										</ul>
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter className="gap-2 sm:gap-0">
							{customDockerImage && (
								<Button
									type="button"
									variant="destructive"
									onClick={handleRemove}
									disabled={isUpdating}
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Use Official Image
								</Button>
							)}
							<Button type="submit" disabled={isUpdating}>
								{isUpdating ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<Save className="h-4 w-4 mr-2" />
										Save
									</>
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
