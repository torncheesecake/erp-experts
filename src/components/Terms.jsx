/**
 * ERP Experts Terms and Conditions Page
 */

import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

const definitions = [
  {
    term: "Aftercare",
    definition: "EEE's Aftercare Service Offering.",
  },
  {
    term: "BRD",
    definition:
      "a business requirements document prepared by EEE to the Customer describing the Services required, the scope of the Project and setting out the estimated timetable (including without limitation Project Milestones) and responsibilities of each of the parties for, or in connection with, the provision of the Services by EEE in accordance with the Contract and including a description or specification of the Services.",
  },
  {
    term: "Company's Project Manager",
    definition: "EEE's manager for the Project, appointed in accordance with clause 10.3.",
  },
  {
    term: "Conditions",
    definition: "these terms and conditions as amended from time to time in accordance with clause 25.",
  },
  {
    term: "Contract",
    definition:
      "the contract between EEE and the Customer for the supply of the Services in accordance with the Quotation, the Conditions and the BRD.",
  },
  {
    term: "Customer",
    definition: "the person, firm or company who purchases Services from EEE.",
  },
  {
    term: "Customer's Project Manager",
    definition: "the Customer's manager for the Project appointed in accordance with clause 11.1.1.",
  },
  {
    term: "Deliverables",
    definition:
      "all products and materials developed by EEE in relation to the Project in any media, including, without limitation, computer programs, data, diagrams, reports and specifications (including drafts).",
  },
  {
    term: "EEE",
    definition:
      "ERP Experts Ltd a company incorporated and registered in England and Wales with company number 10196491 whose registered office is at Dalton House, Lakhpur Court, Staffordshire Technology Park, Stafford ST18 0FX",
  },
  {
    term: "Fees",
    definition: "the fees payable to EEE, as set out in the Quotation or the BRD for the Services.",
  },
  {
    term: "Intellectual Property Rights",
    definition:
      "patents, rights to inventions, copyright and related rights, trademarks, trade names, domain names, rights in get-up, rights in goodwill or to sue for passing off, unfair competition rights, rights in designs, rights in computer software, database rights, topography rights, moral rights, rights in confidential information (including without limitation know-how and trade secrets) and any other intellectual property rights, in each case whether registered or unregistered, and including without limitation all applications for, and renewals or extensions of, such rights, and all similar or equivalent rights or forms of protection in any part of the world.",
  },
  {
    term: "NetSuite Subscription",
    definition:
      "a subscription to the NetSuite platform service which may be purchased by EEE on behalf of the Customer.",
  },
  {
    term: "Payment Terms",
    definition:
      "Unless otherwise stated on a transaction, our default Payment Terms are strictly NET15. Expenses are not included, and will be recharged in full.",
  },
  {
    term: "Pre-existing Materials",
    definition: "materials which existed before the commencement of the Project.",
  },
  {
    term: "Project",
    definition: "the project as described in the BRD.",
  },
  {
    term: "Project Milestone",
    definition:
      "a date by which a part of the Project is estimated to be completed, as set out in the BRD.",
  },
  {
    term: "Quotation",
    definition: "the quotation to which these terms are attached.",
  },
  {
    term: "Services",
    definition:
      "the services to be provided by EEE under the Contract set out in the Quotation and/or the BRD.",
  },
  {
    term: "Software",
    definition:
      "the computer programs listed in the BRD, either owned by EEE and any Maintenance Release which is acquired by the Customer during the subsistence of this Contract.",
  },
  {
    term: "Third-Party Additional Terms",
    definition: "any terms and conditions relating to Third-Party Software.",
  },
  {
    term: "Third-Party Software",
    definition: "the third-party software identified in the BRD.",
  },
  {
    term: "VAT",
    definition:
      "value added tax chargeable under English law for the time being and any similar additional tax.",
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="pt-(--space-4xl) pb-(--space-2xl) md:pb-(--space-3xl)">
        <div className="container">
          <div className="max-w-5xl">
            <p className="text-label text-primary" style={{ marginBottom: "var(--space-lg)" }}>
              Legal
            </p>
            <h1 className="text-hero" style={{ marginBottom: "var(--space-2xl)" }}>
              Terms and
              <br />
              <span className="text-primary">Conditions</span>.
            </h1>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="pb-(--space-3xl) md:pb-(--space-4xl)">
        <div className="container">
          <div className="prose prose-lg max-w-none terms-content">
            <ol className="terms-list">
              {/* 1. Interpretation */}
              <li>
                <strong>Interpretation</strong>
                <p>The definitions and rules of interpretation in this clause apply in these Conditions.</p>
                <ol>
                  <li>
                    <strong>Definitions:</strong>
                    <div className="overflow-x-auto mt-lg">
                      <table className="terms-table">
                        <tbody>
                          {definitions.map((def, i) => (
                            <tr key={i}>
                              <th>{def.term}</th>
                              <td>{def.definition}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </li>
                </ol>
              </li>

              {/* 2. Application of conditions */}
              <li>
                <strong>Application of conditions</strong>
                <ol>
                  <li>
                    These Conditions shall:
                    <ol>
                      <li>apply to and be incorporated in the Contract; and</li>
                      <li>
                        prevail over any inconsistent terms or conditions contained in, or referred to in,
                        the Customer's purchase order, confirmation of order, or specification, or implied
                        by law, trade custom, practice or course of dealing.
                      </li>
                    </ol>
                  </li>
                </ol>
              </li>

              {/* 3. Basis of Contract */}
              <li>
                <strong>Basis of Contract</strong>
                <ol>
                  <li>
                    The Contract shall be deemed to be accepted when both the Customer and EEE sign the
                    Quotation at which point, and on which date the Contract shall come into existence.
                  </li>
                  <li>
                    The Contract incorporates the Conditions to the exclusion of any other terms or
                    conditions that the Customer seeks to impose or incorporate, or which are implied by
                    trade, custom, practice or course of dealing.
                  </li>
                  <li>
                    Any Quotation given by EEE shall not constitute an offer, and is only valid for a
                    period of 20 days from its date of issue.
                  </li>
                  <li>
                    If the Customer instructs EEE to produce a BRD, the provision of the BRD shall be part
                    of the Services and shall form part of the Contract.
                  </li>
                </ol>
              </li>

              {/* 4. NetSuite */}
              <li>
                <strong>NetSuite</strong>
                <ol>
                  <li>
                    This clause 4 shall apply if the Quotation or the BRD states that EEE shall purchase
                    the NetSuite Subscription on behalf of the Customer.
                  </li>
                  <li>
                    The Fees for EEE purchasing the NetSuite Subscription shall be included in the
                    Quotation.
                  </li>
                  <li>
                    EEE shall use reasonable endeavours to inform the Customer (no later than 14 days
                    prior to the expiry of the NetSuite Subscription) that the NetSuite Subscription is
                    nearing expiry and the renewal price. The Customer shall inform EEE prior to the
                    expiry date whether or not it is instructing EEE to renew the NetSuite Subscription on
                    behalf of the Customer.
                  </li>
                  <li>
                    If the Customer does instruct EEE to renew the NetSuite Subscription prior to the
                    expiry date, EEE shall renew the NetSuite Subscription and shall invoice the Customer
                    with the renewal price.
                  </li>
                  <li>
                    If the Customer does not instruct EEE to renew the NetSuite Subscription prior to its
                    expiry, EEE shall cancel the NetSuite Subscription (or allow it to expire) on the
                    expiry date, and shall not be liable for any loss to the Customer as a result of such
                    cancellation.
                  </li>
                  <li>
                    Without prejudice to any other right or remedy that EEE may have, if the Customer
                    fails to make any payment to EEE under this Contract within 30 days of the payment
                    becoming due, EEE may suspend the NetSuite Subscription until payment has been made in
                    full.
                  </li>
                  <li>
                    If the Contract is terminated in accordance with clause 19, EEE shall be entitled to
                    (in its sole discretion) terminate the NetSuite Subscription, and the balance of all
                    outstanding fees for the remainder of the subscription period payable to NetSuite will
                    become immediately due and payable by the Customer to EEE.
                  </li>
                </ol>
              </li>

              {/* 5. Equipment */}
              <li>
                <strong>Equipment</strong>
                <ol>
                  <li>
                    The following clauses 5 to 9 (inclusive) shall only apply if the Contact Details set
                    out that EEE is providing Equipment to the Customer.
                  </li>
                  <li>
                    The quantity and description of the Equipment and any technical specification shall be
                    as set out in the Quotation or the BRD.
                  </li>
                  <li>
                    EEE shall use its reasonable endeavours to transfer to the Customer the benefit of any
                    warranty or guarantee given by the manufacturer to EEE. The Customer acknowledges that
                    EEE is a reseller of the Equipment; any claim that the Customer has in respect of the
                    quality of the Equipment or any defect, glitch or other issue concerning the Equipment
                    or the Software should first be directed to the manufacturer or ultimate supplier of
                    the Equipment, details of which EEE shall provide to the Customer on delivery of the
                    Equipment.
                  </li>
                  <li>
                    EEE's employees, contractors and agents are not authorised to make any representations
                    or contractually binding statements concerning the Equipment.
                  </li>
                </ol>
              </li>

              {/* 6. Delivery of Equipment */}
              <li>
                <strong>Delivery of Equipment</strong>
                <ol>
                  <li>
                    EEE shall use its reasonable endeavours to deliver the Equipment on the date or dates
                    agreed with the Customer, but any such date is approximate only. Unless specifically
                    agreed between the Parties in writing, time is not of the essence as to the delivery
                    of the Equipment and EEE shall not have any liability (subject to Clause 17) for any
                    delay in delivery, however caused.
                  </li>
                  <li>
                    The Customer shall be responsible (at the Customer's cost) for preparing the delivery
                    location for the delivery of the Equipment and for the provision of all necessary
                    access and facilities reasonably required to deliver and install the Equipment. If EEE
                    is prevented from carrying out delivery or installation on the specified date because
                    no such preparation has been carried out, EEE may levy additional charges to recover
                    its loss arising from this event.
                  </li>
                  <li>
                    EEE shall be responsible for any damage, shortage or loss in transit, provided that
                    the Customer notifies it to EEE (or its carrier, if applicable) within two days of
                    delivery or the proposed delivery date of the Equipment and that the Equipment has
                    been handled in accordance with EEE's stipulations. Any remedy under this Clause 6.3
                    shall be limited, at EEEs option, to the replacement or repair of any Equipment which
                    is proven to EEE's satisfaction to have been lost or damaged in transit.
                  </li>
                </ol>
              </li>

              {/* 7. Installation */}
              <li>
                <strong>Installation</strong>
                <p>
                  If EEE is installing the Equipment as part of the Services, EEE shall at the Customer's
                  expense install the Equipment at the Customer's premises. The Customer shall procure
                  that a duly authorised representative of the Customer shall be present at the
                  installation of the Equipment. Acceptance by such representative of installation shall
                  constitute conclusive evidence that the Customer and EEE have each examined the
                  Equipment and has found it to be in good condition, complete and fit in every way for
                  the purpose for which it is intended.
                </p>
              </li>

              {/* 8. Quality of Equipment */}
              <li>
                <strong>Quality of Equipment</strong>
                <ol>
                  <li>
                    EEE warrants that on delivery the Equipment shall:
                    <ol>
                      <li>
                        conform in all material respects with their description in the Quotation and
                        (where relevant), the BRD; and
                      </li>
                      <li>be free from material defects in design, material and workmanship.</li>
                    </ol>
                  </li>
                  <li>
                    Subject to the Customer complying with clause 5.3, and subject to clause 8.3, EEE
                    shall, at its option, repair or replace the defective Equipment, or refund the price
                    of the defective Equipment in full if:
                    <ol>
                      <li>
                        the Customer gives notice in writing within one month of delivery and within a
                        reasonable time of discovery that some or all of the Equipment do not comply with
                        the warranty set out in clause 8.1;
                      </li>
                      <li>EEE is given a reasonable opportunity of examining such Equipment; and</li>
                      <li>
                        the Customer (if asked to do so by EEE) returns such Equipment to EEE's place of
                        business at the Customer's cost.
                      </li>
                    </ol>
                  </li>
                  <li>
                    EEE shall not be liable for the Equipment' failure to comply with the warranty in
                    clause 8.1 if:
                    <ol>
                      <li>
                        the Customer makes any further use of such Equipment after giving a notice in
                        accordance with clause 8.2;
                      </li>
                      <li>
                        the defect arises because the Customer failed to follow EEE's oral or written
                        instructions as to the storage, installation, commissioning, use or maintenance of
                        the Equipment or (if there are none) good trade practice;
                      </li>
                      <li>
                        the Customer alters or repairs such Equipment without the written consent of EEE;
                      </li>
                      <li>
                        the defect arises as a result of fair wear and tear, wilful damage, negligence, or
                        abnormal working conditions; or
                      </li>
                      <li>
                        the Equipment differs from their description as a result of changes made to ensure
                        they comply with applicable statutory or regulatory standards.
                      </li>
                    </ol>
                  </li>
                  <li>
                    Except as provided in this clause 8, EEE shall have no liability to the Customer in
                    respect of the Equipment' failure to comply with the warranty set out in clause 8.1.
                  </li>
                  <li>
                    The terms of these Conditions shall apply to any repaired or replacement Equipment
                    supplied by EEE.
                  </li>
                </ol>
              </li>

              {/* 9. Title and risk */}
              <li>
                <strong>Title and risk</strong>
                <ol>
                  <li>
                    The risk in the Equipment shall pass to the Customer on completion of delivery. EEE
                    shall off-load the Equipment at the Customer's risk.
                  </li>
                  <li>
                    Title to the Equipment shall not pass to the Customer until EEE receives payment in
                    full (in cash or cleared funds) for the Equipment.
                  </li>
                  <li>
                    Until title to the Equipment has passed to the Customer, the Customer shall:
                    <ol>
                      <li>
                        store the Equipment separately from all other goods held by the Customer so that
                        they remain readily identifiable as EEE's property;
                      </li>
                      <li>
                        not remove, deface or obscure any identifying mark or packaging on or relating to
                        the Equipment;
                      </li>
                      <li>
                        maintain the Equipment in satisfactory condition and keep them insured against all
                        risks for their full price on EEE's behalf from the date of delivery;
                      </li>
                      <li>
                        give EEE such information relating to the Equipment as EEE may require from time
                        to time.
                      </li>
                    </ol>
                  </li>
                </ol>
              </li>

              {/* 10. EEE's obligations */}
              <li>
                <strong>EEE's obligations</strong>
                <ol>
                  <li>
                    If EEE is providing the BRD as part of the Services, EEE shall use reasonable
                    endeavours to manage and complete the Project, and to deliver the Deliverables to the
                    Customer, in accordance in all material respects with the BRD.
                  </li>
                  <li>
                    EEE shall use reasonable endeavours to meet the performance dates specified in the
                    BRD, but any such dates shall be estimates only and time shall not be of the essence
                    of the Contract.
                  </li>
                  <li>
                    EEE shall appoint EEE's Project Manager who shall have authority to contractually bind
                    EEE on all matters relating to the Project. EEE shall use reasonable endeavours to
                    ensure that the same person acts as Company's Project Manager throughout the Project,
                    but may replace him from time to time where reasonably necessary in the interests of
                    EEE's business.
                  </li>
                </ol>
              </li>

              {/* 11. Customer's obligations */}
              <li>
                <strong>Customer's obligations</strong>
                <ol>
                  <li>
                    The Customer shall:
                    <ol>
                      <li>
                        co-operate with EEE in all matters relating to the Project and appoint the
                        Customer's Project Manager, who shall have the authority to contractually bind the
                        Customer on matters relating to the Project;
                      </li>
                      <li>
                        provide in a timely manner such access to the Customer's premises and data, and
                        such office accommodation and other facilities, as is requested by EEE;
                      </li>
                      <li>
                        provide in a timely manner such information as EEE may request, and ensure that
                        such information is accurate in all material respects; and
                      </li>
                      <li>
                        be responsible (at its own cost) for preparing the relevant premises for the
                        supply of the Services.
                      </li>
                    </ol>
                  </li>
                  <li>
                    If EEE's performance of its obligations under the Contract is prevented or delayed by
                    any act or omission of the Customer or the Customer's agents, sub-contractors or
                    employees, the Customer shall in all circumstances be liable to pay to EEE on demand
                    all reasonable costs, charges or losses sustained or incurred by it (including,
                    without limitation, any direct, indirect or consequential losses, loss of profit and
                    loss of reputation, loss or damage to property, injury to or death of any person and
                    loss of opportunity to deploy resources elsewhere), subject to EEE confirming such
                    costs, charges and losses to the Customer in writing.
                  </li>
                  <li>
                    The Customer shall not, without the prior written consent of EEE, at any time from the
                    date of the Contract to the expiry of six months after the completion of the Services,
                    solicit or entice away from EEE or employ or attempt to employ any person who is, or
                    has been, engaged as an employee or sub-contractor of EEE, except that the Customer
                    shall not be in breach of this clause 6.3 if it hires an employee or sub-contractor of
                    EEE as a result of a recruitment campaign not specifically targeted to any employees
                    or sub-contractors of EEE.
                  </li>
                  <li>
                    Any consent given by EEE in accordance with clause 6.3 shall be subject to the
                    Customer paying to EEE on demand a sum equivalent to 20% of the then current annual
                    remuneration of EEE's employee or sub-contractor or, if higher, 20% of the annual
                    remuneration to be paid by the Customer to such employee or sub-contractor.
                  </li>
                </ol>
              </li>

              {/* 12. Change control */}
              <li>
                <strong>Change control</strong>
                <ol>
                  <li>
                    If either party wishes to change the scope of the Services, it shall submit details of
                    the requested change to the other in writing.
                  </li>
                  <li>
                    If either party requests a change to the scope or execution of the Services, EEE
                    shall, within a reasonable time, provide a written estimate to the Customer of:
                    <ol>
                      <li>the likely time required to implement the change;</li>
                      <li>any variations to EEE's charges arising from the change;</li>
                      <li>the likely effect of the change on the BRD; and</li>
                      <li>any other impact of the change on the terms of the Contract.</li>
                    </ol>
                  </li>
                  <li>
                    If EEE requests a change to the scope of the Services, the Customer shall not
                    unreasonably withhold or delay consent to it.
                  </li>
                  <li>
                    If the Customer wishes EEE to proceed with the change, EEE has no obligation to do so
                    unless and until the parties have agreed in writing on the necessary variations to its
                    charges, the BRD and any other relevant terms of the Contract to take account of the
                    change.
                  </li>
                </ol>
              </li>

              {/* 13. Charges and payment */}
              <li>
                <strong>Charges and payment</strong>
                <ol>
                  <li>
                    The Customer shall pay Fees for the Services as set out in the Quotation and (where
                    relevant), the BRD.
                  </li>
                  <li>
                    Clause 13.3 shall apply if the Services are to be provided on a time-and-materials
                    basis. Clause 13.4 and clause 13.5 shall apply if the Services are to be provided for
                    a fixed price. The remainder of this clause 13 shall apply in either case.
                  </li>
                  <li>
                    Where the Services are provided on a time-and-materials basis:
                    <ol>
                      <li>
                        the charges payable for the Services shall be calculated in accordance with EEE's
                        standard daily fee rates as amended from time to time;
                      </li>
                      <li>
                        EEE's standard daily fee rates are calculated on the basis of an eight-hour day
                        worked between 8.00 am and 5.00 pm on weekdays (excluding weekends and public
                        holidays);
                      </li>
                      <li>
                        EEE shall be entitled to charge at an overtime rate of the normal rate for part
                        days and for time worked by members of the project team outside the hours referred
                        to in clause 13.3.2 on a pro-rata basis;
                      </li>
                      <li>
                        EEE shall ensure that all members of the project team complete time sheets
                        recording time spent on the Project, and EEE shall use such time sheets to
                        calculate the charges covered by each monthly invoice referred to in clause 13.3.5;
                        and
                      </li>
                      <li>
                        EEE shall invoice the Customer monthly in arrear for its charges for time, expenses
                        and materials (together with VAT where appropriate) for the month concerned,
                        calculated as provided in this clause 13. Any expenses, materials and third party
                        services shall be invoiced by EEE. Each invoice shall set out the time spent by
                        each member of the project team and provide a detailed breakdown of any expenses
                        and materials, accompanied by the relevant receipts.
                      </li>
                    </ol>
                  </li>
                  <li>
                    Where the Services are provided for a fixed price the total price for the Services
                    shall be the amount set out in the Quotation and (where relevant), the BRD. The total
                    price shall be paid to EEE in instalments as set out in the Quotation and (where
                    relevant), the BRD on its achieving the corresponding Project Milestone. On achieving
                    a Project Milestone, EEE shall invoice the Customer for the charges that are then
                    payable, together with expenses and the costs of materials (and VAT, where
                    appropriate), calculated as provided in clause 13.5.
                  </li>
                  <li>
                    Any fixed price contained in the Quotation and (where relevant), the BRD excludes:
                    <ol>
                      <li>
                        the cost of hotel, subsistence, travelling and any other ancillary expenses
                        reasonably incurred by the project team in connection with the Services, and the
                        cost of any materials or services reasonably and properly provided by third parties
                        required by EEE for the supply of the Services. Such expenses, materials and third
                        party services shall be invoiced by EEE at cost; and
                      </li>
                      <li>VAT, which EEE shall add to its invoices at the appropriate rate.</li>
                    </ol>
                  </li>
                  <li>
                    The Customer shall pay each invoice submitted to it by EEE in full, and in cleared
                    funds, within 30 days of receipt, or the Terms specified on the Invoice - whichever is
                    sooner.
                  </li>
                  <li>
                    Without prejudice to any other right or remedy that EEE may have, if the Customer
                    fails to pay any sums due of whatsoever nature to EEE on the due date EEE may:
                    <ol>
                      <li>
                        charge interest on such sum from the due date for payment at the annual rate of 4%
                        above the base lending rate from time to time of Barclays Bank plc, accruing on a
                        daily basis and being compounded quarterly until payment is made, whether before or
                        after any judgment;
                      </li>
                      <li>suspend all Services until payment has been made in full.</li>
                    </ol>
                  </li>
                  <li>Time for payment shall be of the essence of the Contract.</li>
                  <li>
                    All payments payable to EEE under the Contract shall become due immediately on
                    termination of the Contract, despite any other provision. This condition is without
                    prejudice to any right to claim for interest under the law, or any such right under
                    the Contract.
                  </li>
                  <li>
                    All amounts due under this Contract shall be paid by the Customer to EEE in full
                    without any set-off, counterclaim, deduction or withholding (other than any deduction
                    or withholding of tax as required by law). EEE may, without prejudice to any other
                    rights it may have, set off any liability of the Customer to EEE against any liability
                    of EEE to the Customer.
                  </li>
                </ol>
              </li>

              {/* 14. Intellectual Property Rights */}
              <li>
                <strong>Intellectual Property Rights</strong>
                <ol>
                  <li>
                    The Customer acknowledges and agrees that, as between the parties, EEE and/or its
                    licensors own all Intellectual Property Rights in the Deliverables, all materials
                    connected with the Services and in any material developed or produced in connection
                    with the Contract by EEE, its officers, employees, subcontractors or agents. Except as
                    expressly stated herein, this Contract does not grant the Customer any rights to such
                    Intellectual Property Rights.
                  </li>
                  <li>
                    EEE hereby licenses all such rights to the Customer on a non-exclusive,
                    non-transferable and worldwide basis to such extent as is necessary to enable the
                    Customer to make reasonable use of the Deliverables and the Services as is envisaged
                    by the parties. If EEE terminates the Contract under clause 19.1, this licence will
                    automatically terminate.
                  </li>
                  <li>
                    The Customer acknowledges that the Customer's use of rights in Pre-existing Materials
                    is conditional on EEE obtaining a written end-user licence (or sub-licence) of such
                    rights from the relevant licensor or licensors on such terms as will entitle EEE to
                    license such rights to the Customer.
                  </li>
                </ol>
              </li>

              {/* 15. Licence */}
              <li>
                <strong>Licence</strong>
                <p>
                  This clause 15 shall apply if EEE is providing Software to the Customer as part of the
                  Services.
                </p>
                <ol>
                  <li>
                    EEE grants to the Customer a non-exclusive licence to use the Software at the Site
                    only (Licence).
                  </li>
                  <li>
                    In relation to scope of use of the Licence:
                    <ol>
                      <li>
                        for the purposes of clause 15.1, use of the Software shall be restricted to use of
                        the Software in object code form for the purpose of processing the Customer's data
                        for the normal business purposes of the Customer (which shall not include allowing
                        the use of the Software by, or for the benefit of, any person other than an
                        employee of the Customer).
                      </li>
                      <li>
                        For the purposes of clause 15.3.1, "use of the Software" means loading the Software
                        into temporary memory or permanent storage on the relevant computer, provided that
                        installation on a network server for distribution to other computers is not "use"
                        if the Software is licensed under this Licence for use on each computer to which
                        the Software is distributed.
                      </li>
                      <li>
                        the Customer may not use the Software other than as specified in clause 15.1 and
                        clause 15.2.1 without the prior written consent of EEE, and the Customer
                        acknowledges that additional fees may be payable on any change of use approved by
                        EEE.
                      </li>
                      <li>
                        the Customer may make as many backup copies of the Software as may be necessary for
                        its lawful use. The Customer shall record the number and location of all copies of
                        the Software and take steps to prevent unauthorised copying.
                      </li>
                      <li>
                        except as expressly stated in this clause 15, the Customer has no right (and shall
                        not permit any third party) to copy, adapt, reverse engineer, decompile,
                        disassemble, modify, adapt or make error corrections to the Software in whole or in
                        part except to the extent that any reduction of the Software to human readable form
                        (whether by reverse engineering, decompilation or disassembly) is necessary for the
                        purposes of integrating the operation of the Software with the operation of other
                        software or systems used by the Customer, unless EEE is prepared to carry out such
                        action at a reasonable commercial fee or has provided the information necessary to
                        achieve such integration within a reasonable period, and the Customer shall request
                        EEE to carry out such action or to provide such information (and shall meet EEE's
                        reasonable costs in providing that information) before undertaking any such
                        reduction.
                      </li>
                      <li>
                        the Customer shall indemnify and hold EEE harmless against any loss or damage which
                        it may suffer or incur as a result of the Customer's breach of any Third-Party
                        Additional Terms howsoever arising.
                      </li>
                      <li>
                        EEE may treat the Customer's breach of any Third-Party Additional Terms as a breach
                        of this Licence.
                      </li>
                    </ol>
                  </li>
                  <li>
                    The Customer shall:
                    <ol>
                      <li>
                        ensure that the number of persons using the Software does not exceed the number in
                        the Quotation and (where relevant), the BRD;
                      </li>
                      <li>ensure that the Software is installed on designated equipment only;</li>
                      <li>
                        keep a complete and accurate record of the Customer's copying and disclosure of the
                        Software and its users, and produce such record to EEE on request from time to
                        time;
                      </li>
                      <li>
                        notify EEE as soon as it becomes aware of any unauthorized use of the Software by
                        any person;
                      </li>
                      <li>
                        pay, for broadening the scope of the licences granted under this Licence to cover
                        the unauthorized use, an amount equal to the fees which EEE would have levied (in
                        accordance with its normal commercial terms then current) had it licensed any such
                        unauthorised use on the date when such use commenced.
                      </li>
                    </ol>
                  </li>
                  <li>
                    The Customer shall permit EEE to inspect and have access to any premises (and to the
                    computer equipment located there) at or on which the Software is being kept or used,
                    and have access to any records kept in connection with this Licence, for the purposes
                    of ensuring that the Customer is complying with the terms of this Licence, provided
                    that EEE provides reasonable advance notice to the Customer of such inspections, which
                    shall take place at reasonable times.
                  </li>
                  <li>
                    EEE does not warrant that the use of the Software will be uninterrupted or error-free.
                  </li>
                  <li>
                    The Customer acknowledges that all Intellectual Property Rights in the Software and
                    any Maintenance Releases belong and shall belong to EEE or the relevant third-party
                    owners (as the case may be), and the Customer shall have no rights in or to the
                    Software other than the right to use it in accordance with the terms of this Licence.
                  </li>
                </ol>
              </li>

              {/* 16. Maintenance releases */}
              <li>
                <strong>Maintenance releases</strong>
                <p>
                  If EEE is providing Software as part of the Services, EEE will provide the Customer with
                  all Maintenance Releases generally made available to its customers. EEE warrants that no
                  Maintenance Release will adversely affect the then existing facilities or functions of
                  the Software. The Customer shall install all Maintenance Releases as soon as reasonably
                  practicable after receipt.
                </p>
              </li>

              {/* 17. Confidentiality */}
              <li>
                <strong>Confidentiality</strong>
                <ol>
                  <li>
                    Each party undertakes that it shall not at any time during the term of the Contract,
                    and for a period of five years after termination of the Contract, disclose to any
                    person any confidential information concerning the business, affairs, customers,
                    clients or suppliers of the other party, except as permitted by clause 17.2.
                  </li>
                  <li>
                    Each party may disclose the other party's confidential information:
                    <ol>
                      <li>
                        to its employees, officers, representatives, subcontractors or advisers who need to
                        know such information for the purposes of carrying out the party's obligations
                        under the Contract. Each party shall ensure that its employees, officers,
                        representatives, subcontractors or advisers to whom it discloses the other party's
                        confidential information comply with this clause 10; and
                      </li>
                      <li>
                        as may be required by law, a court of competent jurisdiction or any governmental or
                        regulatory authority.
                      </li>
                    </ol>
                  </li>
                  <li>
                    Neither party shall use the other party's confidential information for any purpose
                    other than to perform its obligations under the Contract.
                  </li>
                </ol>
              </li>

              {/* 18. Limitation of liability */}
              <li>
                <strong>Limitation of liability</strong>
                <ol>
                  <li>
                    The following provisions set out the entire financial liability of EEE (including
                    without limitation any liability for the acts or omissions of its employees, agents
                    and sub-contractors) to the Customer in respect of:
                    <ol>
                      <li>any breach of the Contract howsoever arising;</li>
                      <li>
                        any use made by the Customer of the Services, the Deliverables or any part of them;
                        and
                      </li>
                      <li>
                        any representation, misrepresentation (whether innocent or negligent), statement or
                        tortious act or omission (including without limitation negligence) arising under or
                        in connection with the Contract.
                      </li>
                    </ol>
                  </li>
                  <li>
                    All warranties, conditions and other terms implied by statute or common law are, to
                    the fullest extent permitted by law, excluded from the Contract.
                  </li>
                  <li>
                    Nothing in these conditions excludes the liability of EEE:
                    <ol>
                      <li>for death or personal injury caused by EEE's negligence; or</li>
                      <li>for fraud or fraudulent misrepresentation.</li>
                    </ol>
                  </li>
                  <li>
                    Subject to clause 18.2 and clause 18.3:
                    <ol>
                      <li>
                        EEE shall not in any circumstances be liable, whether in tort (including without
                        limitation for negligence or breach of statutory duty howsoever arising), contract,
                        misrepresentation (whether innocent or negligent) or otherwise for any loss of
                        profits, loss of business, depletion of goodwill or similar losses, or pure
                        economic loss, or for any indirect or consequential loss, costs, damages, charges
                        or expenses however arising; and
                      </li>
                      <li>
                        EEE's total liability in contract, tort (including without limitation negligence or
                        breach of statutory duty howsoever arising), misrepresentation (whether innocent or
                        negligent), restitution or otherwise, arising in connection with the performance or
                        contemplated performance of the Contract shall be limited to the price paid for the
                        Services.
                      </li>
                    </ol>
                  </li>
                </ol>
              </li>

              {/* 19. Termination */}
              <li>
                <strong>Termination</strong>
                <ol>
                  <li>
                    Without prejudice to any other rights or remedies to which the parties may be
                    entitled, either party may terminate the Contract without liability to the other if:
                    <ol>
                      <li>
                        the other party fails to pay any amount due under this Contract on the due date for
                        payment and remains in default not less than 30 days after being notified in
                        writing to make such payment;
                      </li>
                      <li>
                        the other party commits a material breach of any other term of this Contract which
                        breach is irremediable or (if such breach is remediable) fails to remedy that
                        breach within a period of 14 days after being notified in writing to do so;
                      </li>
                      <li>
                        the other party suspends, or threatens to suspend, payment of its debts or is
                        unable to pay its debts as they fall due or admits inability to pay its debts or is
                        deemed unable to pay its debts within the meaning of section 123 of the Insolvency
                        Act 1986;
                      </li>
                      <li>
                        the other party commences negotiations with all or any class of its creditors with
                        a view to rescheduling any of its debts, or makes a proposal for or enters into any
                        compromise or arrangement with its creditors other than for the sole purpose of a
                        scheme for a solvent amalgamation of that other party with one or more other
                        companies or the solvent reconstruction of that other party;
                      </li>
                      <li>
                        a petition is filed, a notice is given, a resolution is passed, or an order is
                        made, for or in connection with the winding up of that other party other than for
                        the sole purpose of a scheme for a solvent amalgamation of that other party with
                        one or more other companies or the solvent reconstruction of that other party;
                      </li>
                      <li>
                        an application is made to court, or an order is made, for the appointment of an
                        administrator, or if a notice of intention to appoint an administrator is given or
                        if an administrator is appointed, over the other party;
                      </li>
                      <li>
                        the holder of a qualifying floating charge over the assets of that other party has
                        become entitled to appoint or has appointed an administrative receiver;
                      </li>
                      <li>
                        a person becomes entitled to appoint a receiver over the assets of the other party
                        or a receiver is appointed over the assets of the other party;
                      </li>
                      <li>
                        a creditor or encumbrancer of the other party attaches or takes possession of, or a
                        distress, execution, sequestration or other such process is levied or enforced on
                        or sued against, the whole or any part of the other party's assets and such
                        attachment or process is not discharged within 14 days;
                      </li>
                      <li>
                        any event occurs, or proceeding is taken, with respect to the other party in any
                        jurisdiction to which it is subject that has an effect equivalent or similar to any
                        of the events mentioned in clause 19.1.3 to clause 19.1.9 (inclusive);
                      </li>
                      <li>
                        there is a change of control of the other party (within the meaning of section 1124
                        of the Corporation Tax Act 2010).
                      </li>
                    </ol>
                  </li>
                  <li>
                    Any provision of this Contract that expressly or by implication is intended to come
                    into or continue in force on or after termination or expiry of this Contract shall
                    remain in full force and effect.
                  </li>
                  <li>
                    On termination of this Contract for any reason:
                    <ol>
                      <li>EEE shall immediately cease provision of the Services;</li>
                      <li>
                        each party shall return and make no further use of any equipment, property,
                        materials and other items (and all copies of them) belonging to the other party.
                      </li>
                    </ol>
                  </li>
                  <li>
                    Termination of this Contract shall not affect any rights, remedies, obligations or
                    liabilities of the parties that have accrued up to the date of termination, including
                    the right to claim damages in respect of any breach of the agreement which existed at
                    or before the date of termination.
                  </li>
                </ol>
              </li>

              {/* 20. Force majeure */}
              <li>
                <strong>Force majeure</strong>
                <p>
                  EEE shall not in any circumstances have any liability to the Customer under the Contract
                  if it is prevented from, or delayed in, performing its obligations under the Contract or
                  from carrying on its business by acts, events, omissions or accidents beyond its
                  reasonable control, including, without limitation, strikes, lock-outs or other
                  industrial disputes (whether involving the workforce of EEE or any other party), failure
                  of a utility service or transport network, act of God, war, riot, civil commotion,
                  malicious damage, compliance with any law or governmental order, rule, regulation or
                  direction, accident, breakdown of plant or machinery, fire, flood, storm or default of
                  suppliers or sub-contractors.
                </p>
              </li>

              {/* 21. Waiver */}
              <li>
                <strong>Waiver</strong>
                <p>
                  No failure or delay by a party to exercise any right or remedy provided under this
                  Contract or by law shall constitute a waiver of that or any other right or remedy, nor
                  shall it prevent or restrict the further exercise of that or any other right or remedy.
                  No single or partial exercise of such right or remedy shall prevent or restrict the
                  further exercise of that or any other right or remedy.
                </p>
              </li>

              {/* 22. Rights and remedies */}
              <li>
                <strong>Rights and remedies</strong>
                <p>
                  The rights and remedies provided under this Contract are in addition to, and not
                  exclusive of, any rights or remedies provided by law.
                </p>
              </li>

              {/* 23. Severance */}
              <li>
                <strong>Severance</strong>
                <ol>
                  <li>
                    If any provision or part-provision of this Contract is or becomes invalid, illegal or
                    unenforceable, it shall be deemed modified to the minimum extent necessary to make it
                    valid, legal and enforceable. If such modification is not possible, the relevant
                    provision or part-provision shall be deemed deleted. Any modification to or deletion
                    of a provision or part-provision under this clause shall not affect the validity and
                    enforceability of the rest of this Contract.
                  </li>
                  <li>
                    If any provision or part-provision of this Contract is invalid, illegal or
                    unenforceable, the parties shall negotiate in good faith to amend such provision so
                    that, as amended, it is legal, valid and enforceable, and, to the greatest extent
                    possible, achieves the intended commercial result of the original provision.
                  </li>
                </ol>
              </li>

              {/* 24. Entire agreement */}
              <li>
                <strong>Entire agreement</strong>
                <ol>
                  <li>
                    This Contract constitutes the entire agreement between the parties and supersedes and
                    extinguishes all previous agreements, promises, assurances, warranties, representations
                    and understandings between them, whether written or oral, relating to its subject
                    matter.
                  </li>
                  <li>
                    Each party acknowledges that in entering into this Contract it does not rely on, and
                    shall have no remedies in respect of, any statement, representation, assurance or
                    warranty (whether made innocently or negligently) that is not set out in this
                    Contract.
                  </li>
                  <li>
                    Each party agrees that it shall have no claim for innocent or negligent
                    misrepresentation or negligent misstatement based on any statement in this Contract.
                  </li>
                </ol>
              </li>

              {/* 25. Variation */}
              <li>
                <strong>Variation</strong>
                <p>
                  Except as set out in these Conditions, no variation of the Contract shall be effective
                  unless it is agreed in writing and signed by the parties (or their authorised
                  representatives).
                </p>
              </li>

              {/* 26. Assignment */}
              <li>
                <strong>Assignment</strong>
                <ol>
                  <li>
                    The Customer shall not, without the prior written consent of EEE, assign, transfer,
                    charge, sub-contract or deal in any other manner with all or any of its rights or
                    obligations under the Contract.
                  </li>
                  <li>
                    EEE may at any time assign, transfer, charge, sub-contract or deal in any other manner
                    with all or any of its rights or obligations under the Contract.
                  </li>
                </ol>
              </li>

              {/* 27. No partnership or agency */}
              <li>
                <strong>No partnership or agency</strong>
                <p>
                  Nothing in the Contract is intended to or shall operate to create a partnership between
                  the parties, or to authorise either party to act as agent for the other, and neither
                  party shall have authority to act in the name or on behalf of or otherwise to bind the
                  other in any way (including without limitation the making of any representation or
                  warranty, the assumption of any obligation or liability and the exercise of any right or
                  power).
                </p>
              </li>

              {/* 28. Third party rights */}
              <li>
                <strong>Third party rights</strong>
                <p>
                  No one other than a party to this Contract, their successors and permitted assignees,
                  shall have any right to enforce any of its terms.
                </p>
              </li>

              {/* 29. Notices */}
              <li>
                <strong>Notices</strong>
                <ol>
                  <li>
                    Any notice or other communication given to a party under or in connection with this
                    contract shall be in writing and shall be:
                    <ol>
                      <li>
                        delivered by hand or by pre-paid first-class post or other next working day
                        delivery service at its registered office; or
                      </li>
                      <li>sent by fax to its main fax number.</li>
                    </ol>
                  </li>
                  <li>
                    Any notice or communication shall be deemed to have been received:
                    <ol>
                      <li>
                        if delivered by hand, on signature of a delivery receipt or at the time the notice
                        is left at the proper address;
                      </li>
                      <li>
                        if sent by pre-paid first-class post or other next working day delivery service, at
                        9.00 am on the second Business Day after posting or at the time recorded by the
                        delivery service;
                      </li>
                      <li>if sent by fax, at 9.00 am on the next Business Day after transmission.</li>
                    </ol>
                  </li>
                  <li>
                    This clause does not apply to the service of any proceedings or other documents in any
                    legal action or, where applicable, any arbitration or other method of dispute
                    resolution. For the purposes of this clause, "writing" shall not include email.
                  </li>
                </ol>
              </li>

              {/* 30. Governing law */}
              <li>
                <strong>Governing law</strong>
                <p>
                  The Contract and any disputes or claims arising out of or in connection with it or its
                  subject matter or formation (including without limitation non-contractual disputes or
                  claims) are governed by and construed in accordance with the law of England and Wales.
                </p>
              </li>

              {/* 31. Jurisdiction */}
              <li>
                <strong>Jurisdiction</strong>
                <p>
                  Each party irrevocably agrees that the courts of England and Wales shall have exclusive
                  jurisdiction to settle any dispute or claim arising out of or in connection with this
                  Contract or its subject matter or formation (including non-contractual disputes or
                  claims).
                </p>
              </li>

              {/* 32. Aftercare */}
              <li>
                <strong>Aftercare</strong>
                <ol>
                  <li>
                    <strong>Termination of Aftercare Service</strong>
                    <p>
                      Upon Termination of the Aftercare Service, any Apps which are licenced via the
                      Aftercare service will no longer be legally licenced and thus will be remotely
                      deactivated. Alternatively they can be purchased separately.
                    </p>
                  </li>
                  <li>
                    <strong>Unused Hours</strong>
                    <p>
                      Upon Expiry of the Aftercare Service, any Hours which are unused, fully paid for,
                      and accrued via the Aftercare service will be valid for 50% of the Aftercare
                      Contract Length, capped at a maximum of 6 months.
                    </p>
                    <p>For example:</p>
                    <ul className="list-disc pl-lg">
                      <li>
                        A 24 Month Aftercare Contract with 40 hours accrued will have 6 months to consume
                        the unspent hours.
                      </li>
                      <li>
                        A 6 Month Aftercare Contract with 15 hours accrued will have 3 months to consume
                        the unspent hours.
                      </li>
                    </ul>
                  </li>
                </ol>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
