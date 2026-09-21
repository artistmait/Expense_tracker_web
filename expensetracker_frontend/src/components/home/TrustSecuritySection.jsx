import { ShieldCheck, Lock, EyeOff, FileCheck2, Database } from 'lucide-react';

export function TrustSecuritySection() {
  const pillars = [
    {
      icon: Lock,
      title: "Bank-Grade 256-Bit TLS Encryption",
      desc: "Every packet of your expense, income, and portfolio data is encrypted in transit and at rest using AES-256 standards.",
      tag: "Military Standard"
    },
    {
      icon: EyeOff,
      title: "Zero-Knowledge Data Privacy",
      desc: "Your financial records are strictly private. We never monetize, sell, or disclose your transactional habits to third-party ad brokers.",
      tag: "Strict Privacy"
    },
    {
      icon: FileCheck2,
      title: "SOC-2 Type II Audited Architecture",
      desc: "Independently audited annually to verify strict controls over organizational security, availability, and financial ledger confidentiality.",
      tag: "Independently Audited"
    },
    {
      icon: Database,
      title: "Instant Redundant Vault Backups",
      desc: "Automated distributed state replication ensures your expense logs, budgets, and stock records are protected from data loss.",
      tag: "99.99% Uptime"
    }
  ];

  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#EDF6FC] via-white to-white border border-[#C4E2F5] p-6 sm:p-8 shadow-sm">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C4E2F5]/60 text-[#2C5EAD] text-xs font-bold mb-3 border border-[#1591DC]/30">
          <ShieldCheck className="w-4 h-4 text-[#1591DC]" />
          <span>Institutional Trust & Privacy Guarantee</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Engineered for Total Financial Privacy
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Your money management requires uncompromising confidentiality. Aegis combines institutional cryptography with granular expense tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-[#C4E2F5]/70 hover:border-[#1591DC]/60 hover:shadow-md transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-[#C4E2F5]/50 text-[#2C5EAD] flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-[#1591DC] uppercase tracking-wider block mb-1">
                {pillar.tag}
              </span>
              <h4 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                {pillar.title}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
