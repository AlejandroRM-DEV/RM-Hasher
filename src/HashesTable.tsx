import { useState, useRef, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Record, Algorithm } from "@/types";
import { Button } from "@/components/ui/button";
import { FileDigit } from "lucide-react";

const columnHelper = createColumnHelper<Record>();

const columns = [
	columnHelper.accessor("path", {
		header: "Path",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("blake3", {
		header: "BLAKE3",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("sha3_256", {
		header: "SHA3-256",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("sha3_512", {
		header: "SHA3-512",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("sha256", {
		header: "SHA-256",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("sha512", {
		header: "SHA-512",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("sha1", {
		header: "SHA-1",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("md5", {
		header: "MD5",
		cell: (info) => info.getValue(),
	}),
];

export function HashesTable({ algorithms }: { algorithms: Algorithm[] }) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "path", desc: false },
	]);
	const [data, setData] = useState<Record[]>([]);

	useEffect(() => {
		const unlistenDiscovered = listen("file-discovered", (event) => {
			console.log("🗂 file discovered:", event.payload);
			setData((prevData) => [...prevData, event.payload as Record]);
		});

		const unlistenUpdated = listen("file-updated", (event) => {
			console.log("🔄 file updated:", event.payload);
		});

		const unlistenProgress = listen("hash-progress", (event) => {
			console.log("⏳ progress:", event.payload);
		});

		return () => {
			unlistenDiscovered.then((fn) => fn());
			unlistenUpdated.then((fn) => fn());
			unlistenProgress.then((fn) => fn());
		};
	}, []);

	const parentRef = useRef<HTMLDivElement>(null);

	const table = useReactTable({
		data,
		columns,
		state: {
			columnVisibility: {
				blake3: algorithms.includes("blake3"),
				sha3_256: algorithms.includes("sha3_256"),
				sha3_512: algorithms.includes("sha3_512"),
				sha256: algorithms.includes("sha256"),
				sha512: algorithms.includes("sha512"),
				sha1: algorithms.includes("sha1"),
				md5: algorithms.includes("md5"),
			},
			sorting,
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const rowVirtualizer = useVirtualizer({
		count: table.getRowModel().rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 48,
		overscan: 10,
	});

	const virtualRows = rowVirtualizer.getVirtualItems();
	const totalSize = rowVirtualizer.getTotalSize();
	const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
	const paddingBottom =
		virtualRows.length > 0
			? totalSize - virtualRows[virtualRows.length - 1].end
			: 0;

	return (
		<div className="grow h-full flex flex-col bg-white rounded-lg shadow">
			<div className="flex-shrink-0 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
				<p className="text-sm text-gray-600">Hashes</p>
				<Button
					size="sm"
					variant="outline"
					onClick={() => {
						console.log("Computing hashes for:", algorithms);
					}}
				>
					<FileDigit /> Compute
				</Button>
			</div>
			<div
				ref={parentRef}
				className="flex-1 overflow-auto border-t-0 rounded-b-lg"
				style={{ contain: "strict" }}
			>
				<div>
					<table className="min-w-full border-collapse">
						<thead className="bg-gray-50 sticky top-0 z-10">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th
											key={header.id}
											className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody>
							{paddingTop > 0 && (
								<tr>
									<td style={{ height: paddingTop }} />
								</tr>
							)}
							{virtualRows.map((virtualRow) => {
								const row = table.getRowModel().rows[virtualRow.index];
								return (
									<tr
										key={row.id}
										className={`border-b border-gray-100 ${
											virtualRow.index % 2 === 0 ? "bg-white" : "bg-gray-50"
										}`}
										style={{
											height: virtualRow.size,
										}}
									>
										{row.getVisibleCells().map((cell) => (
											<td
												key={cell.id}
												className="px-4 py-3 text-sm text-gray-900 font-mono"
												title={String(cell.getValue())}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</td>
										))}
									</tr>
								);
							})}
							{paddingBottom > 0 && (
								<tr>
									<td style={{ height: paddingBottom }} />
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
			<div className="flex-shrink-0 p-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
				<p className="text-xs text-gray-500">
					{data.length.toLocaleString()} records
				</p>
			</div>
		</div>
	);
}
