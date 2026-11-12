export default function DashboardLoading() {
  return <main className="app-content" aria-label="Loading workspace" aria-busy="true">
    <div className="dashboard-skeleton"><div className="skeleton-line" style={{width:92}}/><div className="skeleton-line mt-4" style={{width:250,height:26}}/><div className="skeleton-line mt-3" style={{width:420,maxWidth:"100%"}}/></div>
    <div className="mt-7 grid gap-4 sm:grid-cols-3">{[1,2,3].map(item=><div key={item} className="dashboard-skeleton"><div className="skeleton-line" style={{width:28,height:28}}/><div className="skeleton-line mt-6" style={{width:70,height:27}}/><div className="skeleton-line mt-2" style={{width:110}}/></div>)}</div>
    <div className="mt-7 grid gap-4 lg:grid-cols-[1.2fr_.8fr]"><div className="dashboard-skeleton"><div className="skeleton-line" style={{width:190,height:16}}/><div className="skeleton-line mt-4" style={{width:"90%"}}/><div className="skeleton-line mt-2" style={{width:"72%"}}/></div><div className="dashboard-skeleton"><div className="skeleton-line" style={{width:150,height:16}}/><div className="skeleton-line mt-4" style={{width:"90%"}}/></div></div>
  </main>;
}
