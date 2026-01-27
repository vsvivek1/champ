import Link from 'next/link';

export default function Home() {
    return (
        <div>
            <h1>Welcome to vewLogs</h1>
            <Link href="/cis">
                <a>View CIS Data</a>
            </Link>
        </div>
    );
}
