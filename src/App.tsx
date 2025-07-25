import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarShortcut,
	MenubarSub,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarTrigger,
} from "@/components/ui/menubar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	File,
	Folder,
	Shield,
	Hash,
	Settings,
	Info,
	Keyboard,
	FileCode,
	FileText,
} from "lucide-react";
import { HashesTable } from "@/HashesTable";
import { Algorithm } from "@/types";
import "./App.css";

function App() {
	const [selectedAlgorithms, setSelectedAlgorithms] = useState<Algorithm[]>([]);

	const selectFile = async () => {
		try {
			const selected = await open({
				multiple: true,
				directory: false,
				title: "Seleccionar archivos",
			});

			if (selected) {
				const paths = Array.isArray(selected) ? selected : [selected];
				await invoke("select_files", { paths, algorithms: selectedAlgorithms });
			}
		} catch (error) {
			console.error("Error selecting files:", error);
		}
	};

	const selectFolder = async () => {
		try {
			const selected = await open({
				multiple: false,
				directory: true,
				title: "Seleccionar carpeta",
			});

			if (selected) {
        await invoke('select_files', { paths: [selected], algorithms: selectedAlgorithms });
      }
		} catch (error) {
			console.error("Error selecting folder:", error);
		}
	};

	const toggleAlgorithm = (algorithm: Algorithm) => {
		setSelectedAlgorithms((prev) =>
			prev.includes(algorithm)
				? prev.filter((a) => a !== algorithm)
				: [...prev, algorithm]
		);
	};

	return (
		<main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
			<header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-4 py-4 shadow-sm">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg">
							<Hash className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="text-3xl font-bold text-slate-900 tracking-tight">
								RM Hasher
							</h1>
							<p className="text-slate-600 text-sm font-mono mt-1 tracking-wider uppercase">
								Veritas ex vestigiis digitalibus
							</p>
						</div>
					</div>
					<Badge variant="secondary" className="font-mono">
						v2.1.0
					</Badge>
				</div>
			</header>
			<div className="bg-white/60 backdrop-blur-sm border-b border-slate-200/40">
				<div className="mx-aut px-4">
					<Menubar className="border-none bg-transparent shadow-none">
						<MenubarMenu>
							<MenubarTrigger className="data-[state=open]:bg-slate-100">
								Algorithms
							</MenubarTrigger>
							<MenubarContent>
								<MenubarSub>
									<MenubarSubTrigger>BLAKE</MenubarSubTrigger>
									<MenubarSubContent>
										<MenubarCheckboxItem
											checked={selectedAlgorithms.includes("blake3")}
											onCheckedChange={() => toggleAlgorithm("blake3")}
										>
											BLAKE3
										</MenubarCheckboxItem>
									</MenubarSubContent>
								</MenubarSub>
								<MenubarSub>
									<MenubarSubTrigger>SHA 3</MenubarSubTrigger>
									<MenubarSubContent>
										<MenubarCheckboxItem
											checked={selectedAlgorithms.includes("sha3_256")}
											onCheckedChange={() => toggleAlgorithm("sha3_256")}
										>
											SHA3-256
										</MenubarCheckboxItem>
										<MenubarCheckboxItem
											checked={selectedAlgorithms.includes("sha3_512")}
											onCheckedChange={() => toggleAlgorithm("sha3_512")}
										>
											SHA3-512
										</MenubarCheckboxItem>
									</MenubarSubContent>
								</MenubarSub>
								<MenubarSub>
									<MenubarSubTrigger>SHA 2</MenubarSubTrigger>
									<MenubarSubContent>
										<MenubarCheckboxItem
											checked={selectedAlgorithms.includes("sha256")}
											onCheckedChange={() => toggleAlgorithm("sha256")}
										>
											SHA-256
										</MenubarCheckboxItem>
										<MenubarCheckboxItem
											checked={selectedAlgorithms.includes("sha512")}
											onCheckedChange={() => toggleAlgorithm("sha512")}
										>
											SHA-512
										</MenubarCheckboxItem>
									</MenubarSubContent>
								</MenubarSub>
								<MenubarSub>
									<MenubarSubTrigger>SHA</MenubarSubTrigger>
									<MenubarSubContent>
										<MenubarCheckboxItem
											checked={selectedAlgorithms.includes("sha1")}
											onCheckedChange={() => toggleAlgorithm("sha1")}
										>
											SHA-1
										</MenubarCheckboxItem>
									</MenubarSubContent>
								</MenubarSub>
								<MenubarSub>
									<MenubarSubTrigger>Legacy</MenubarSubTrigger>
									<MenubarSubContent>
										<MenubarCheckboxItem
											checked={selectedAlgorithms.includes("md5")}
											onCheckedChange={() => toggleAlgorithm("md5")}
										>
											MD5
										</MenubarCheckboxItem>
									</MenubarSubContent>
								</MenubarSub>
							</MenubarContent>
						</MenubarMenu>
						<MenubarMenu>
							<MenubarTrigger className="data-[state=open]:bg-slate-100">
								Files
							</MenubarTrigger>
							<MenubarContent>
								<MenubarItem onClick={selectFile}>
									<File className="w-4 h-4 mr-2" />
									Select files
									<MenubarShortcut>⌘O</MenubarShortcut>
								</MenubarItem>
								<MenubarItem onClick={selectFolder}>
									<Folder className="w-4 h-4 mr-2" />
									Select folder
									<MenubarShortcut>⌘D</MenubarShortcut>
								</MenubarItem>
							</MenubarContent>
						</MenubarMenu>
						<MenubarMenu>
							<MenubarTrigger className="data-[state=open]:bg-slate-100">
								Reports
							</MenubarTrigger>
							<MenubarContent>
								<MenubarItem>
									<FileCode className="w-4 h-4 mr-2" />
									Export HTML
									<MenubarShortcut>⌘H</MenubarShortcut>
								</MenubarItem>
								<MenubarItem>
									<FileText className="w-4 h-4 mr-2" />
									Export PDF
									<MenubarShortcut>⌘P</MenubarShortcut>
								</MenubarItem>
								<MenubarSeparator />
								<MenubarItem>
									<Settings className="w-4 h-4 mr-2" />
									Preferences
									<MenubarShortcut>⌘,</MenubarShortcut>
								</MenubarItem>
							</MenubarContent>
						</MenubarMenu>
						<MenubarMenu>
							<MenubarTrigger className="data-[state=open]:bg-slate-100">
								Help
							</MenubarTrigger>
							<MenubarContent>
								<MenubarItem>
									<Info className="w-4 h-4 mr-2" />
									About RM Hasher
								</MenubarItem>
								<MenubarItem>
									<Keyboard className="w-4 h-4 mr-2" />
									Keyboard shortcuts
									<MenubarShortcut>⌘/</MenubarShortcut>
								</MenubarItem>
							</MenubarContent>
						</MenubarMenu>
					</Menubar>
				</div>
			</div>

			<section className="flex-1 px-4 py-4 w-full flex flex-col">
				<HashesTable algorithms={selectedAlgorithms} />
			</section>

			<footer className="bg-slate-900 text-white px-4 py-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<p className="text-sm text-slate-300">
							Developed by{" "}
							<span className="font-semibold text-white">AlejandroRM</span>
						</p>
						<Separator orientation="vertical" className="h-4 bg-slate-700" />
						<p className="text-xs text-slate-400 font-mono">
							Secure • Fast • Reliable
						</p>
					</div>
					<div className="flex items-center space-x-2 text-xs text-slate-400">
						<Shield className="w-4 h-4" />
						<span>All processing done locally</span>
					</div>
				</div>
			</footer>
		</main>
	);
}

export default App;
